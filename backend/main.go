package main

import (
	"fmt"
	"net/http"

	"katanaid/database"
	"katanaid/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func main() {
	// Connect to database
	database.Connect()
	defer database.Close()

	// Initialize router
	r := chi.NewRouter()

	// CORS middleware
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "https://katanaid.com"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Register health endpoint
	r.Get("/health", handlers.Health)
	r.Post("/signup", handlers.Signup)
	r.Post("/login", handlers.Login)

	// Start server
	fmt.Println("Server is running on port 8080")
	http.ListenAndServe(":8080", r)
}
