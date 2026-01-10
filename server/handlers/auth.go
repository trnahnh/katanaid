package handlers

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	mrand "math/rand"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"katanaid/database"
	"katanaid/models"
	"katanaid/util"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/resend/resend-go/v2"
	"golang.org/x/crypto/bcrypt"
)

// -----------------------------------Signup-----------------------------------
func Signup(w http.ResponseWriter, r *http.Request) {
	var req models.SignupRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Print("Error decoding JSON:", err)
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Something went wrong"})
		return
	}

	username := strings.TrimSpace(req.Username)
	email := strings.ToLower(strings.TrimSpace(req.Email)) // Normalize. No duplicate
	password := strings.TrimSpace(req.Password)

	if username == "" || email == "" || password == "" {
		log.Print("Request has empty field")
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Username, email and password required"})
		return
	}

	if len(username) < 3 {
		log.Print("Username length less than 3")
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Username must be at least 3 characters"})
		return
	} else if len(username) > 60 {
		log.Print("Username length exceeded 60")
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Username cannot exceed 60 characters"})
		return
	}

	if !isValidEmail(email) {
		log.Print("Invalid email format")
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Invalid email"})
		return
	}

	if len(password) < 8 {
		log.Print("Password length less than 8")
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Password must be at least 8 characters"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Print("Error generating password hash")
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Something went wrong"})
		return
	}

	// Begin transaction, Signup rollback point
	ctx := r.Context()
	tx, err := database.DB.Begin(ctx)
	if err != nil {
		log.Print("Error starting transaction:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Something went wrong"})
		return
	}
	defer tx.Rollback(ctx)

	var userID int
	err = tx.QueryRow(
		ctx,
		"INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
		username,
		email,
		string(hashedPassword),
	).Scan(&userID)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			switch pgErr.ConstraintName {
			case "users_email_key":
				util.WriteJSON(w, http.StatusConflict, models.ErrorResponse{Error: "Email already registered"})
			default:
				util.WriteJSON(w, http.StatusConflict, models.ErrorResponse{Error: "Account already registered"})
			}
			return
		}
		log.Print("Error creating account in DB:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Something went wrong"})
		return
	}

	// Generate JWT
	tokenString, err := generateSignedToken(userID, username, email, false)
	if err != nil {
		log.Print("Error generating token for signup:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Something went wrong"})
		return
	}

	// Generate email verification token
	rawEmailToken, hashedEmailToken, err := generateEmailVerificationToken()
	if err != nil {
		log.Print("Error generating token for email verification:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Something went wrong"})
		return
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, hashedEmailToken, time.Now().Add(24*time.Hour),
	)
	if err != nil {
		log.Print("Error storing email verification:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Something went wrong"})
		return
	}

	err = sendVerificationEmail(rawEmailToken, email, username)
	if err != nil {
		log.Print("Error sending verification email:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Something went wrong"})
		return
	}

	// Commit transaction
	err = tx.Commit(ctx)
	if err != nil {
		log.Print("Error committing transaction:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Something went wrong"})
		return
	}

	log.Printf("New user signed up: %s - %s", username, email)

	util.WriteJSON(w, http.StatusCreated, models.AuthSuccessResponse{
		Token:         tokenString,
		Username:      username,
		Email:         email,
		EmailVerified: false,
	})
}

// -----------------------------------Verify email-----------------------------------
func VerifyEmail(w http.ResponseWriter, r *http.Request) {
	frontendURL := os.Getenv("FRONTEND_URL")

	token := r.URL.Query().Get("token")
	if token == "" {
		http.Redirect(w, r, fmt.Sprintf("%s/auth/verified?error=missing_token", frontendURL), http.StatusTemporaryRedirect)
		return
	}

	userID, username, email, err := verifyToken(r.Context(), database.DB, token)
	if err != nil {
		http.Redirect(w, r, fmt.Sprintf("%s/auth/verified?error=invalid_token", frontendURL), http.StatusTemporaryRedirect)
		return
	}

	// Generate new JWT with email_verified: true
	jwtToken, err := generateSignedToken(userID, username, email, true)
	if err != nil {
		http.Redirect(w, r, fmt.Sprintf("%s/auth/verified?error=token_generation_failed", frontendURL), http.StatusTemporaryRedirect)
		return
	}

	log.Printf("User verified email: %s - %s", username, email)
	http.Redirect(w, r, fmt.Sprintf("%s/auth/verified?token=%s", frontendURL, jwtToken), http.StatusTemporaryRedirect)
}

// -----------------------------------Login-----------------------------------
func Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Print("Error decoding JSON:", err)
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Something went wrong"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := strings.TrimSpace(req.Password)

	if email == "" || password == "" {
		log.Print("Request has empty field")
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Email and password required"})
		return
	}

	var user models.User
	err = database.DB.QueryRow(
		context.Background(),
		"SELECT id, username, email, password_hash, email_verified FROM users WHERE email = $1",
		email,
	).Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.EmailVerified)

	if err != nil {
		log.Print("Incorrect username or password")
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Incorrect username or password"})
		return
	}

	// Notify user if user uses OAuth
	if strings.HasPrefix(user.PasswordHash, "oauth:") {
		parts := strings.Split(user.PasswordHash, ":")
		provider := "OAuth"
		if len(parts) >= 2 {
			provider = strings.Title(parts[1]) // Capitalize Google
		}
		log.Printf("OAuth user attempted password login: %s", email)
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: fmt.Sprintf("This account uses %s login", provider)})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		log.Print("Incorrect username or password")
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Incorrect username or password"})
		return
	}

	tokenString, err := generateSignedToken(user.ID, user.Username, user.Email, user.EmailVerified)
	if err != nil {
		log.Print("Error generating token for login:", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Something went wrong"})
		return
	}

	log.Printf("User logged in: %s - %s", user.Username, user.Email)
	util.WriteJSON(w, http.StatusOK, models.AuthSuccessResponse{
		Token:         tokenString,
		Username:      user.Username,
		Email:         user.Email,
		EmailVerified: user.EmailVerified,
	})
}

// -----------------------------------Helpers-----------------------------------
func generateSignedToken(userID int, username, email string, emailVerified bool) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":        userID,
		"username":       username,
		"email":          email,
		"email_verified": emailVerified,
		"iat":            time.Now().Unix(),
		"exp":            time.Now().Add(time.Hour * 24).Unix(),
	})
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

var emailRegex = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

func isValidEmail(email string) bool {
	return emailRegex.MatchString(email)
}

func generateEmailVerificationToken() (raw string, hashed string, err error) {
	b := make([]byte, 64)
	if _, err := rand.Read(b); err != nil {
		return "", "", err
	}
	raw = hex.EncodeToString(b)

	h := sha256.Sum256([]byte(raw))
	hashed = hex.EncodeToString(h[:])

	return raw, hashed, nil
}

func findVerification(
	ctx context.Context,
	db *pgxpool.Pool,
	hashedToken string) (userID int, expiresAt time.Time, err error) {
	err = db.QueryRow(ctx,
		`SELECT user_id, expires_at FROM email_verifications WHERE token_hash = $1`,
		hashedToken,
	).Scan(&userID, &expiresAt)
	return
}

func deleteVerification(ctx context.Context, db *pgxpool.Pool, hashedToken string) error {
	_, err := db.Exec(ctx,
		`DELETE FROM email_verifications WHERE token_hash = $1`, hashedToken)
	return err
}

func verifyToken(ctx context.Context, db *pgxpool.Pool, incomingToken string) (int, string, string, error) {
	h := sha256.Sum256([]byte(incomingToken))
	hashedToken := hex.EncodeToString(h[:])

	userID, expiresAt, err := findVerification(ctx, db, hashedToken)
	if err != nil {
		return 0, "", "", errors.New("invalid token")
	}

	if time.Now().After(expiresAt) {
		_ = deleteVerification(ctx, db, hashedToken)
		return 0, "", "", errors.New("token expired")
	}

	_, err = db.Exec(ctx, `UPDATE users SET email_verified = TRUE WHERE id = $1`, userID)
	if err != nil {
		return 0, "", "", errors.New("failed to verify user")
	}

	// Fetch user info for JWT generation
	var username, email string
	err = db.QueryRow(ctx, `SELECT username, email FROM users WHERE id = $1`, userID).Scan(&username, &email)
	if err != nil {
		return 0, "", "", errors.New("failed to fetch user")
	}

	err = deleteVerification(ctx, db, hashedToken)
	if err != nil {
		return 0, "", "", err
	}

	return userID, username, email, nil
}

func sendVerificationEmail(token string, email string, username string) error {
	client := resend.NewClient(os.Getenv("RESEND_API_KEY"))

	link := fmt.Sprintf("%s/auth/verify-email?token=%s", os.Getenv("BACKEND_URL"), token)
	names := []string{"Anh", "Khiem"}
	name := names[mrand.Intn(len(names))]

	params := &resend.SendEmailRequest{
		From:    "KatanaID <noreply@katanaid.com>",
		To:      []string{email},
		Subject: "KatanaID Email Verification",
		Html: fmt.Sprintf(`
		<p>Hello, %s</p>
		<br>
		<p>This is %s from KatanaID</p>
		<p>Click the link below to verify your email</p>
		<a href="%s">Verify Email</a>`, username, name, link),
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		return err
	}

	return nil
}
