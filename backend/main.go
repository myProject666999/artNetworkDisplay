package main

import (
	"artnetworkdisplay/config"
	"artnetworkdisplay/middleware"
	"artnetworkdisplay/models"
	"artnetworkdisplay/routes"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()
	db, err := config.InitDB()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer db.Close()

	if err := models.Migrate(db); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	routes.SetupRoutes(r, db)

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
