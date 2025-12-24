package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"log"
	"os"
)

func main() {
	fmt.Print("Hello from the backend!")
	godotenv.Load()

	app := gin.Default()
	app.GET("/health", healthCheck)

	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT is undefined")
	}

	app.Run(":" + port)
}

func healthCheck(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "healthy",
	})
}
