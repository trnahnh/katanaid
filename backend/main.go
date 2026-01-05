package main

import (
	"database/sql"
	"embed"
	"fmt"
	"log"
	"net/http"
	"os"

	"katanaid/database"
	"katanaid/handlers"
	"katanaid/middleware"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
	"github.com/pressly/goose/v3"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

//go:embed migrations/*.sql
var embedMigrations embed.FS

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}

	db, err := sql.Open("pgx", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("Failed to open DB for migrations:", err)
	}

	goose.SetBaseFS(embedMigrations)

	if err := goose.SetDialect("postgres"); err != nil {
		log.Fatal("Failed to set dialect:", err)
	}

	if err := goose.Up(db, "migrations"); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	db.Close()

	// Connect to database
	database.Connect()
	defer database.Close()

	// Initialize OAuth
	if err := handlers.InitOAuth(); err != nil {
		log.Fatal("Failed to initialize OAuth:", err)
	}

	// Initialize router
	r := chi.NewRouter()

	// CORS middleware
	allowedOrigins := []string{"http://localhost:5173", "https://katanaid.com"}
	if frontendURL := os.Getenv("FRONTEND_URL"); frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
	}
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Register health endpoint
	r.Get("/health", handlers.Health)

	// Auth endpoints
	r.Route("/auth", func(r chi.Router) {
		r.Use(middleware.AuthRateLimiter())
		r.Post("/signup", handlers.Signup)
		r.Post("/login", handlers.Login)
		r.Get("/verify-email", handlers.VerifyEmail)
	})

	// Contact endpoint
	r.With(middleware.ContactRateLimiter()).Post("/api/contact", handlers.Contact)

	// OAuth endpoints
	r.Get("/auth/google", handlers.GoogleLogin)
	r.Get("/auth/google/callback", handlers.GoogleCallback)
	r.Get("/auth/github", handlers.GitHubLogin)
	r.Get("/auth/github/callback", handlers.GitHubCallback)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Println("Server is running on port", port)
	http.ListenAndServe(":"+port, r)
}
