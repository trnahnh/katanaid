package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"katanaid/database"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

// ---------------------------Signup---------------------------
func Signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest

	// Decode JSON body
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Print("Error decoding JSON:", err)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Something went wrong"})
		return
	}

	username := strings.ToLower(strings.TrimSpace(req.Username)) // Normalize. No duplicate
	email := strings.ToLower(strings.TrimSpace(req.Email))       // Normalize. No duplicate
	password := strings.TrimSpace(req.Password)

	// Validate input
	if username == "" || email == "" || password == "" {
		log.Print("Request has empty field")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Username, email and password required"})
		return
	}

	if len(username) < 3 {
		log.Print("Username length less than 3")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Username must be at least 3 characters"})
		return
	}

	if !isValidEmail(email) {
		log.Print("Invalid email format")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid email"})
		return
	}

	if len(password) < 8 {
		log.Print("Password length less than 8")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Password must be at least 8 characters"})
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Print("Error generating password hash")
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong"})
		return
	}

	// Insert user into database and get the new user ID
	var userID int
	err = database.DB.QueryRow(
		context.Background(),
		"INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
		username,
		email,
		string(hashedPassword),
	).Scan(&userID)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			switch pgErr.ConstraintName {
			case "users_username_key":
				writeJSON(w, http.StatusConflict, ErrorResponse{Error: "Username already taken"})
			case "users_email_key":
				writeJSON(w, http.StatusConflict, ErrorResponse{Error: "Email already registered"})
			default:
				writeJSON(w, http.StatusConflict, ErrorResponse{Error: "Account already registered"})
			}
			return
		}
		log.Print("Error creating account in DB:", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong"})
		return
	}

	// Generating token
	tokenString, err := generateSignedToken(userID, username, email)
	if err != nil {
		log.Print("Error generating token for signup:", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong"})
		return
	}

	// Log successful signup
	log.Printf("New user signed up: %s - %s", username, email)

	writeJSON(w, http.StatusCreated, AuthSuccessResponse{
		Token:    tokenString,
		Username: username,
		Email:    email,
		Message:  "Successfully created user",
	})
}

// ---------------------------Login---------------------------
func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest

	// Decode JSON body
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Print("Error decoding JSON:", err)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Something went wrong"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := strings.TrimSpace(req.Password)

	// Validate input
	if email == "" || password == "" {
		log.Print("Request has empty field")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Email and password required"})
		return
	}

	// Find user by email
	var user User
	err = database.DB.QueryRow(
		context.Background(),
		"SELECT id, username, email, password_hash FROM users WHERE email = $1",
		email,
	).Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash)

	if err != nil {
		log.Print("Incorrect username or password")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Incorrect username or password"})
		return
	}

	// Compare password with hash
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		log.Print("Incorrect username or password")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Incorrect username or password"})
		return
	}

	tokenString, err := generateSignedToken(user.ID, user.Username, user.Email)
	if err != nil {
		log.Print("Error generating token for login:", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong"})
		return
	}

	// Log successful login
	log.Printf("User logged in: %s - %s", user.Username, user.Email)

	// Success response
	writeJSON(w, http.StatusOK, AuthSuccessResponse{
		Token:    tokenString,
		Username: user.Username,
		Email:    user.Email,
		Message:  "Successfully logged in",
	})
}

// ---------------------------Helpers---------------------------
func generateSignedToken(userID int, username, email string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"email":    email,
		"iat":      time.Now().Unix(),
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

var emailRegex = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

func isValidEmail(email string) bool {
	return emailRegex.MatchString(email)
}
