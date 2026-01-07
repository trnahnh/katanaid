package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"google.golang.org/genai"
)

func GenerateUsername(w http.ResponseWriter, r *http.Request) {
	var req UsernameGenerationRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Print("Error decoding JSON:", err)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Something went wrong"})
		return
	}

	count, err := strconv.Atoi(req.Count)
	if err != nil {
		log.Print("Invalid value for count:", err)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Something went wrong"})
		return
	}

	vibe := strings.ToLower(strings.TrimSpace(req.Vibe))
	if vibe == "" || len(vibe) > 15 {
		log.Print("Invalid vibe")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid request"})
		return
	}

	if count > 10 || count < 0 {
		log.Print("Invalid username request")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid request"})
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	result, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.5-flash-lite",
		genai.Text(fmt.Sprintf(
			"Generate exactly %d unique usernames with a %s vibe. Output only the usernames separated by commas, no additional text, no spaces after commas, no numbering.",
			count,
			vibe,
		)),
		nil,
	)
	if err != nil {
		log.Print("Error generating username:", err)
		writeJSON(w, http.StatusServiceUnavailable, ErrorResponse{Error: "Username generation quota exceeded"})
		return
	}

	writeJSON(w, http.StatusOK, UsernameGenerationSuccessResponse{Usernames: result.Text()})
}
