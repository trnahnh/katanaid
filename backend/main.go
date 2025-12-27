package main

import (
	"fmt"
	"net/http"

	"katanaid/database"
	"katanaid/handlers"

	"github.com/go-chi/chi/v5"
)

func main() {
	// Connect to database
	database.Connect()
	defer database.Close()

	// Initialize router
	r := chi.NewRouter()

	// Register health endpoint
	r.Get("/health", handlers.Health)
	r.Post("/signup", handlers.Signup)
	r.Post("/login", handlers.Login)

	// Start server
	fmt.Println("Server is running on port 8080")
	http.ListenAndServe(":8080", r)
}
