package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"

	"katanaid/database"
)

// ContactRequest is the expected JSON body
type ContactRequest struct {
	Email  string `json:"email"`
	Reason string `json:"reason"`
}

// ContactResponse is the success response
type ContactResponse struct {
	Message string `json:"message"`
}

// Email validation regex
var contactEmailRegex = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

// Contact handles POST /api/contact
func Contact(w http.ResponseWriter, r *http.Request) {
	var req ContactRequest

	// Decode JSON body
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Print("Error decoding JSON:", err)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid JSON"})
		return
	}

	// Normalize input
	email := strings.ToLower(strings.TrimSpace(req.Email))
	reason := strings.TrimSpace(req.Reason)

	// Validate input
	if email == "" || reason == "" {
		log.Print("Missing required fields")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Email and reason are required"})
		return
	}

	if !contactEmailRegex.MatchString(email) {
		log.Print("Invalid email format")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid email format"})
		return
	}

	if len(reason) < 10 {
		log.Print("Reason too short")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Please provide more details (at least 10 characters)"})
		return
	}

	if len(reason) > 2000 {
		log.Print("Reason too long")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Message too long (max 2000 characters)"})
		return
	}

	// Save to database
	_, err = database.DB.Exec(
		context.Background(),
		"INSERT INTO contacts (email, reason) VALUES ($1, $2)",
		email,
		reason,
	)

	if err != nil {
		log.Print("Error saving contact:", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to submit contact"})
		return
	}

	log.Printf("New contact submission from: %s", email)

	writeJSON(w, http.StatusCreated, ContactResponse{
		Message: "Thank you for contacting us! We'll get back to you soon.",
	})
}
