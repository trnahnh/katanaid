package handlers

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Allowed file types
var allowedTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
	"video/mp4":  true,
	"video/webm": true,
	"audio/mpeg": true,
	"audio/wav":  true,
}

// Max file size: 100MB
const maxFileSize = 100 << 20

// UploadResponse is the success response
type UploadResponse struct {
	FileID   string `json:"file_id"`
	Filename string `json:"filename"`
	Size     int64  `json:"size"`
	Type     string `json:"type"`
	Message  string `json:"message"`
}

// Upload handles the file upload request
func Upload(w http.ResponseWriter, r *http.Request) {
	// Limit request size
	r.Body = http.MaxBytesReader(w, r.Body, maxFileSize)

	// Parse multipart form
	err := r.ParseMultipartForm(maxFileSize)
	if err != nil {
		log.Print("Error parsing form:", err)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "File too large (max 100MB)"})
		return
	}

	// Get file from form
	file, header, err := r.FormFile("file")
	if err != nil {
		log.Print("Error getting file:", err)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "No file uploaded"})
		return
	}
	defer file.Close()

	// Check file type
	contentType := header.Header.Get("Content-Type")
	if !allowedTypes[contentType] {
		log.Printf("Invalid file type: %s", contentType)
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "File type not allowed. Use image, video, or audio files."})
		return
	}

	// Generate unique file ID
	fileID := fmt.Sprintf("%d", time.Now().UnixNano())

	// Get file extension
	ext := filepath.Ext(header.Filename)
	if ext == "" {
		ext = getExtensionFromType(contentType)
	}

	// Create unique filename
	newFilename := fileID + ext

	// Create uploads directory if not exists
	uploadsDir := "uploads"
	if err := os.MkdirAll(uploadsDir, os.ModePerm); err != nil {
		log.Print("Error creating uploads directory:", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong"})
		return
	}

	// Create destination file
	destPath := filepath.Join(uploadsDir, newFilename)
	dest, err := os.Create(destPath)
	if err != nil {
		log.Print("Error creating file:", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong"})
		return
	}
	defer dest.Close()

	// Copy file content
	size, err := io.Copy(dest, file)
	if err != nil {
		log.Print("Error saving file:", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Something went wrong"})
		return
	}

	log.Printf("File uploaded: %s (%d bytes)", newFilename, size)

	writeJSON(w, http.StatusOK, UploadResponse{
		FileID:   fileID,
		Filename: newFilename,
		Size:     size,
		Type:     contentType,
		Message:  "File uploaded successfully",
	})
}

// getExtensionFromType returns file extension based on MIME type
func getExtensionFromType(contentType string) string {
	switch {
	case strings.Contains(contentType, "jpeg"):
		return ".jpg"
	case strings.Contains(contentType, "png"):
		return ".png"
	case strings.Contains(contentType, "gif"):
		return ".gif"
	case strings.Contains(contentType, "webp"):
		return ".webp"
	case strings.Contains(contentType, "mp4"):
		return ".mp4"
	case strings.Contains(contentType, "webm"):
		return ".webm"
	case strings.Contains(contentType, "mpeg"):
		return ".mp3"
	case strings.Contains(contentType, "wav"):
		return ".wav"
	default:
		return ".bin"
	}
}
