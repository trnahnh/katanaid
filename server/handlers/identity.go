package handlers

import (
	"context"
	"encoding/base64"
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

func GenerateAvatar(w http.ResponseWriter, r *http.Request) {
	var req AvatarGenerationRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Print("Error decoding JSON:", err)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Something went wrong"})
		return
	}

	style := strings.ToLower(strings.TrimSpace(req.Style))
	traits := strings.TrimSpace(req.Traits)

	// Validate style
	allowedStyles := map[string]bool{
		"realistic": true, "anime": true, "cartoon": true,
		"pixel": true, "watercolor": true, "minimalist": true,
	}
	if !allowedStyles[style] {
		log.Print("Invalid style:", style)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid style"})
		return
	}

	// Validate traits length
	if len(traits) > 100 {
		log.Print("Traits too long")
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Traits must be 100 characters or less"})
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		log.Print("Failed to create Gemini client:", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Service unavailable"})
		return
	}

	// Prompt building
	prompt := fmt.Sprintf(
		"Generate a profile avatar picture in %s art style. Traits: %s. Make it suitable for a social media profile picture, centered on the face/character, clean background.",
		style,
		traits,
	)

	// Use Imagen API for actual image generation
	config := &genai.GenerateImagesConfig{
		NumberOfImages: 1,
	}

	response, err := client.Models.GenerateImages(
		ctx,
		"imagen-4.0-generate-001",
		prompt,
		config,
	)
	if err != nil {
		log.Print("Imagen API error:", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to generate avatar"})
		return
	}

	// Check if we got any images
	if len(response.GeneratedImages) == 0 {
		log.Print("No images generated")
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "No image generated"})
		return
	}

	// Get the first generated image and encode to base64
	imageBytes := response.GeneratedImages[0].Image.ImageBytes
	imageBase64 := base64.StdEncoding.EncodeToString(imageBytes)

	writeJSON(w, http.StatusOK, AvatarGenerationSuccessResponse{Image: imageBase64})
}
