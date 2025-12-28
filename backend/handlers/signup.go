package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"katanaid/database"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// SignupRequest is the expected JSON body
type SignupRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SignupResponse is the success response
type SignupResponse struct {
	Token    string `json:"token"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Message  string `json:"message"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

// Signup handles POST /signup requests
func Signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest

	// Decode JSON body
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Print("Error decoding JSON:", err)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Something went wrong"})
		return
	}

	// Validate input
	if req.Username == "" || req.Email == "" || req.Password == "" {
		http.Error(w, `{"error": "Username, email, and password are required"}`, http.StatusBadRequest)
		return
	}

	if len(req.Username) < 3 {
		http.Error(w, `{"error": "Username must be at least 3 characters"}`, http.StatusBadRequest)
		return
	}

	if len(req.Password) < 8 {
		http.Error(w, `{"error": "Password must be at least 8 characters"}`, http.StatusBadRequest)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error": "Failed to hash password"}`, http.StatusInternalServerError)
		return
	}

	// Insert user into database and get the new user ID
	var userID int
	err = database.DB.QueryRow(
		context.Background(),
		"INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
		strings.ToLower(req.Username),
		strings.ToLower(req.Email),
		string(hashedPassword),
	).Scan(&userID)

	if err != nil {
		// Check for duplicate errors
		if strings.Contains(err.Error(), "duplicate") {
			if strings.Contains(err.Error(), "username") {
				http.Error(w, `{"error": "Username already exists"}`, http.StatusConflict)
				return
			}
			http.Error(w, `{"error": "Email already exists"}`, http.StatusConflict)
			return
		}
		http.Error(w, `{"error": "Failed to create user"}`, http.StatusInternalServerError)
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  userID,
		"username": strings.ToLower(req.Username),
		"email":    strings.ToLower(req.Email),
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	// Sign the token with secret
	jwtSecret := os.Getenv("JWT_SECRET")
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		http.Error(w, `{"error": "Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Log successful signup
	log.Printf("New user signed up: %s (%s)", strings.ToLower(req.Username), strings.ToLower(req.Email))

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(SignupResponse{
		Token:    tokenString,
		Username: strings.ToLower(req.Username),
		Email:    strings.ToLower(req.Email),
		Message:  "User created successfully",
	})
}
