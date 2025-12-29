package handlers

import (
	"context"
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"time"

	"katanaid/database"
)

// AnalyzeRequest is the expected JSON body
type AnalyzeRequest struct {
	FileID   string `json:"file_id"`
	Filename string `json:"filename"`
	FileType string `json:"file_type"`
}

// AnalyzeResponse is the success response
type AnalyzeResponse struct {
	FileID     string  `json:"file_id"`
	Result     string  `json:"result"`
	Confidence float64 `json:"confidence"`
	Details    string  `json:"details"`
	Message    string  `json:"message"`
}

// Analyze handles POST /api/analyze
// Currently returns mock results - will integrate real API later
func Analyze(w http.ResponseWriter, r *http.Request) {
	var req AnalyzeRequest

	// Decode JSON body
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Print("Error decoding JSON:", err)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid JSON"})
		return
	}

	// Validate input
	if req.FileID == "" || req.Filename == "" || req.FileType == "" {
		log.Print("Missing required fields")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "file_id, filename, and file_type are required"})
		return
	}

	// ========== MOCK DETECTION ==========
	// TODO: Replace with real API call (Sightengine, Hive, etc.)

	// Generate random result for testing
	rand.Seed(time.Now().UnixNano())
	isReal := rand.Float64() > 0.5

	var result string
	var confidence float64
	var details string

	if isReal {
		result = "real"
		confidence = 70.0 + rand.Float64()*30.0 // 70-100%
		details = "No manipulation detected. Image appears authentic."
	} else {
		result = "fake"
		confidence = 60.0 + rand.Float64()*35.0 // 60-95%
		details = "Potential manipulation detected. Signs of AI generation or editing found."
	}

	// Round confidence to 2 decimal places
	confidence = float64(int(confidence*100)) / 100

	// ========== END MOCK ==========

	// Store result in database (user_id = 0 for now, will add auth later)
	_, err = database.DB.Exec(
		context.Background(),
		`INSERT INTO analyses (user_id, file_id, filename, file_type, result, confidence, details) 
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		nil, // user_id - TODO: Get from JWT token
		req.FileID,
		req.Filename,
		req.FileType,
		result,
		confidence,
		details,
	)

	if err != nil {
		log.Print("Error saving analysis:", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to save analysis"})
		return
	}

	log.Printf("Analysis complete: %s - %s (%.2f%%)", req.FileID, result, confidence)

	writeJSON(w, http.StatusOK, AnalyzeResponse{
		FileID:     req.FileID,
		Result:     result,
		Confidence: confidence,
		Details:    details,
		Message:    "Analysis complete",
	})
}
