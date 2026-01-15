package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"katanaid/database"
	"katanaid/models"
	"katanaid/util"
)

// GetProfile returns current user's profile
func GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(int)

	var profile models.ProfileResponse
	var firstName, lastName *string

	err := database.DB.QueryRow(
		context.Background(),
		`SELECT username, email, email_verified, first_name, last_name
		FROM users WHERE id = $1`,
		userID,
	).Scan(&profile.Username, &profile.Email, &profile.EmailVerified, &firstName, &lastName)

	if err != nil {
		log.Printf("Error fetching profile: %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch profile"})
		return
	}

	profile.FirstName = firstName
	profile.LastName = lastName

	util.WriteJSON(w, http.StatusOK, profile)
}

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(int)

	var req models.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	// Sanitize and validate
	firstName := strings.TrimSpace(req.FirstName)
	lastName := strings.TrimSpace(req.LastName)

	if len(firstName) > 100 || len(lastName) > 100 {
		util.WriteJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "Name cannot exceed 100 characters"})
		return
	}

	// Update database
	_, err := database.DB.Exec(
		context.Background(),
		`UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3`,
		firstName, lastName, userID,
	)

	if err != nil {
		log.Printf("Error updating profile: %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to update profile"})
		return
	}

	// Fetch updated user data and generate new JWT
	var username, email string
	var emailVerified bool
	err = database.DB.QueryRow(
		context.Background(),
		`SELECT username, email, email_verified FROM users WHERE id = $1`,
		userID,
	).Scan(&username, &email, &emailVerified)

	if err != nil {
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to fetch user"})
		return
	}

	// Generate new token with updated profile
	token, err := generateSignedTokenWithProfile(userID, username, email, emailVerified, &firstName, &lastName)
	if err != nil {
		util.WriteJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	log.Printf("User %d updated profile: %s %s", userID, firstName, lastName)

	util.WriteJSON(w, http.StatusOK, models.AuthSuccessResponse{
		Token:         token,
		Username:      username,
		Email:         email,
		EmailVerified: emailVerified,
		FirstName:     &firstName,
		LastName:      &lastName,
	})
}
