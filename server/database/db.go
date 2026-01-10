package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Database connection pool
var DB *pgxpool.Pool

// Connect initializes the database connection pool
func Connect() {
	// Get database URL from environment variables
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	// Create connection pool
	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}

	DB = pool
	fmt.Println("Connected to PostgreSQL database successfully!")
}

// Close closes the database connection pool
func Close() {
	if DB != nil {
		DB.Close()
	}
}
