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

	requiredEnvs := []string{
		"PORT",
		"DATABASE_URL",
		"JWT_SECRET",
		"GOOGLE_CLIENT_ID",
		"GOOGLE_CLIENT_SECRET",
		"GITHUB_CLIENT_ID",
		"GITHUB_CLIENT_SECRET",
		"RESEND_API_KEY",
		"FRONTEND_URL",
		"BACKEND_URL",
		"DEV_ENVIRONMENT",
		"GOOGLE_API_KEY",
	}

	for _, env := range requiredEnvs {
		if os.Getenv(env) == "" {
			log.Fatal("Missing required env value:", env)
		}
	}

	// Open DB to run migration
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

	// Open DB for user operation
	database.Connect()
	defer database.Close()

	if err := handlers.InitOAuth(); err != nil {
		log.Fatal("Failed to initialize OAuth:", err)
	}

	r := chi.NewRouter()

	allowedOrigins := []string{os.Getenv("FRONTEND_URL")}
	if os.Getenv("DEV_ENVIRONMENT") == "development" {
		allowedOrigins = append(allowedOrigins, os.Getenv("BACKEND_URL"))
	}

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", handlers.Health)

	r.Route("/auth", func(r chi.Router) {
		r.Use(middleware.RateLimiterPerMinute(12))
		r.Post("/signup", handlers.Signup)
		r.Post("/login", handlers.Login)
		r.Get("/verify-email", handlers.VerifyEmail)
	})

	r.With(middleware.RateLimiterPerHour(3)).Post("/api/contact", handlers.Contact)

	r.Get("/auth/google", handlers.GoogleLogin)
	r.Get("/auth/google/callback", handlers.GoogleCallback)
	r.Get("/auth/github", handlers.GitHubLogin)
	r.Get("/auth/github/callback", handlers.GitHubCallback)

	r.Route("/api", func(r chi.Router) {
		r.Use(middleware.RateLimiterPerHour(3))
		r.Post("/identity/username", handlers.GenerateUsername)
		r.Post("/identity/avatar", handlers.GenerateAvatar)
	})

	port := os.Getenv("PORT")
	fmt.Println("Server is starting on port", port)

	log.Fatal(http.ListenAndServe(":"+port, r))
}
