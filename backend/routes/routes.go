package routes

import (
	"artnetworkdisplay/controllers"
	"artnetworkdisplay/middleware"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	authController := &controllers.AuthController{DB: db}
	categoryController := &controllers.CategoryController{DB: db}
	artworkController := &controllers.ArtworkController{DB: db}
	announcementController := &controllers.AnnouncementController{DB: db}
	messageController := &controllers.MessageController{DB: db}
	carouselController := &controllers.CarouselController{DB: db}
	userController := &controllers.UserController{DB: db}
	adminArtworkController := &controllers.AdminArtworkController{DB: db}

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	auth := r.Group("/api/auth")
	{
		auth.POST("/register", authController.Register)
		auth.POST("/login", authController.Login)
	}

	carousel := r.Group("/api/carousel")
	{
		carousel.GET("", carouselController.List)
	}

	categories := r.Group("/api/categories")
	{
		categories.GET("", categoryController.List)
		categories.GET("/:id", categoryController.Get)
	}

	artworks := r.Group("/api/artworks")
	{
		artworks.GET("", artworkController.List)
		artworks.GET("/:id", artworkController.Get)
		artworks.GET("/:id/comments", artworkController.GetComments)
		artworks.GET("/:id/like-status", artworkController.GetLikeStatus)
		artworks.GET("/:id/favorite-status", artworkController.GetFavoriteStatus)
	}

	announcements := r.Group("/api/announcements")
	{
		announcements.GET("", announcementController.List)
		announcements.GET("/:id", announcementController.Get)
	}

	messages := r.Group("/api/messages")
	{
		messages.GET("", messageController.List)
		messages.GET("/:id", messageController.Get)
	}

	authRequired := r.Group("/api")
	authRequired.Use(middleware.JWTMiddleware())
	{
		authRequired.GET("/user", authController.GetCurrentUser)
		authRequired.PUT("/user/profile", authController.UpdateProfile)
		authRequired.PUT("/user/password", authController.ChangePassword)

		authRequired.POST("/artworks/:id/like", artworkController.Like)
		authRequired.POST("/artworks/:id/dislike", artworkController.Dislike)
		authRequired.POST("/artworks/:id/favorite", artworkController.AddFavorite)
		authRequired.DELETE("/artworks/:id/favorite", artworkController.RemoveFavorite)
		authRequired.POST("/artworks/:id/comments", artworkController.AddComment)

		authRequired.GET("/favorites", userController.GetFavorites)

		authRequired.POST("/messages", messageController.Create)
	}

	admin := r.Group("/api/admin")
	admin.Use(middleware.JWTMiddleware())
	admin.Use(middleware.AdminMiddleware())
	{
		admin.GET("/users", userController.List)
		admin.GET("/users/:id", userController.Get)
		admin.POST("/users", userController.Create)
		admin.PUT("/users/:id", userController.Update)
		admin.DELETE("/users/:id", userController.Delete)

		admin.GET("/categories", categoryController.List)
		admin.GET("/categories/:id", categoryController.Get)
		admin.POST("/categories", categoryController.Create)
		admin.PUT("/categories/:id", categoryController.Update)
		admin.DELETE("/categories/:id", categoryController.Delete)

		admin.GET("/artworks", adminArtworkController.List)
		admin.GET("/artworks/:id", adminArtworkController.Get)
		admin.POST("/artworks", adminArtworkController.Create)
		admin.PUT("/artworks/:id", adminArtworkController.Update)
		admin.DELETE("/artworks/:id", adminArtworkController.Delete)
		admin.GET("/artworks/:id/comments", adminArtworkController.GetComments)
		admin.DELETE("/comments/:id", adminArtworkController.DeleteComment)

		admin.GET("/announcements", announcementController.AdminList)
		admin.GET("/announcements/:id", announcementController.Get)
		admin.POST("/announcements", announcementController.Create)
		admin.PUT("/announcements/:id", announcementController.Update)
		admin.DELETE("/announcements/:id", announcementController.Delete)

		admin.GET("/messages", messageController.AdminList)
		admin.GET("/messages/:id", messageController.AdminGet)
		admin.DELETE("/messages/:id", messageController.Delete)
		admin.POST("/messages/:id/reply", messageController.Reply)

		admin.GET("/carousel", carouselController.AdminList)
		admin.GET("/carousel/:id", carouselController.Get)
		admin.POST("/carousel", carouselController.Create)
		admin.PUT("/carousel/:id", carouselController.Update)
		admin.DELETE("/carousel/:id", carouselController.Delete)
	}
}
