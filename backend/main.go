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

	// Auth endpoints
	r.Post("/auth/signup", handlers.Signup)
	r.Post("/auth/login", handlers.Login)

	// Upload endpoint
	r.Post("/api/upload", handlers.Upload)

	// Analyze endpoint
	r.Post("/api/analyze", handlers.Analyze)

	// Start server
	fmt.Println("Server is running on port 8080")
	http.ListenAndServe(":8080", r)
}
