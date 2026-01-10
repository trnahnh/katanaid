package handlers

import (
	"net/http"
	"time"

	"katanaid/util"
)

// JSON structure returning
type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
}

// Health handlers to GET /health
func Health(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	util.WriteJSON(w, http.StatusOK, response)
}
