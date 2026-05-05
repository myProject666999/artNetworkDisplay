package controllers

import (
	"artnetworkdisplay/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

type ArtworkController struct {
	DB *gorm.DB
}

func (ac *ArtworkController) List(c *gin.Context) {
	var artworks []models.Artwork
	query := ac.DB.Model(&models.Artwork{}).Preload("Category").Where("status = ?", 1)

	if categoryID := c.Query("category_id"); categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("title LIKE ? OR artist LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if sort := c.Query("sort"); sort != "" {
		switch sort {
		case "views":
			query = query.Order("views DESC")
		case "likes":
			query = query.Order("likes DESC")
		case "newest":
			query = query.Order("created_at DESC")
		default:
			query = query.Order("created_at DESC")
		}
	} else {
		query = query.Order("created_at DESC")
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "12"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 12
	}

	var total int64
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Find(&artworks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get artworks"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      artworks,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (ac *ArtworkController) Get(c *gin.Context) {
	id := c.Param("id")
	var artwork models.Artwork

	if err := ac.DB.Preload("Category").First(&artwork, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Artwork not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get artwork"})
		return
	}

	ac.DB.Model(&artwork).Update("views", artwork.Views+1)
	artwork.Views++

	c.JSON(http.StatusOK, artwork)
}

func (ac *ArtworkController) Like(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")
	var artwork models.Artwork
	if err := ac.DB.First(&artwork, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artwork not found"})
		return
	}

	var existingLike models.LikeDislike
	err := ac.DB.Where("user_id = ? AND artwork_id = ? AND type = ?", userID, id, "like").First(&existingLike).Error

	if err == nil {
		ac.DB.Delete(&existingLike)
		ac.DB.Model(&artwork).Update("likes", gorm.Expr("likes - 1"))
		c.JSON(http.StatusOK, gin.H{"message": "Unliked successfully", "liked": false})
		return
	}

	var existingDislike models.LikeDislike
	if ac.DB.Where("user_id = ? AND artwork_id = ? AND type = ?", userID, id, "dislike").First(&existingDislike).Error == nil {
		ac.DB.Delete(&existingDislike)
		ac.DB.Model(&artwork).Update("dislikes", gorm.Expr("dislikes - 1"))
	}

	like := models.LikeDislike{
		UserID:    userID.(uint),
		ArtworkID: artwork.ID,
		Type:      "like",
	}
	ac.DB.Create(&like)
	ac.DB.Model(&artwork).Update("likes", gorm.Expr("likes + 1"))

	c.JSON(http.StatusOK, gin.H{"message": "Liked successfully", "liked": true})
}

func (ac *ArtworkController) Dislike(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")
	var artwork models.Artwork
	if err := ac.DB.First(&artwork, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artwork not found"})
		return
	}

	var existingDislike models.LikeDislike
	err := ac.DB.Where("user_id = ? AND artwork_id = ? AND type = ?", userID, id, "dislike").First(&existingDislike).Error

	if err == nil {
		ac.DB.Delete(&existingDislike)
		ac.DB.Model(&artwork).Update("dislikes", gorm.Expr("dislikes - 1"))
		c.JSON(http.StatusOK, gin.H{"message": "Undisliked successfully", "disliked": false})
		return
	}

	var existingLike models.LikeDislike
	if ac.DB.Where("user_id = ? AND artwork_id = ? AND type = ?", userID, id, "like").First(&existingLike).Error == nil {
		ac.DB.Delete(&existingLike)
		ac.DB.Model(&artwork).Update("likes", gorm.Expr("likes - 1"))
	}

	dislike := models.LikeDislike{
		UserID:    userID.(uint),
		ArtworkID: artwork.ID,
		Type:      "dislike",
	}
	ac.DB.Create(&dislike)
	ac.DB.Model(&artwork).Update("dislikes", gorm.Expr("dislikes + 1"))

	c.JSON(http.StatusOK, gin.H{"message": "Disliked successfully", "disliked": true})
}

func (ac *ArtworkController) GetLikeStatus(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusOK, gin.H{"liked": false, "disliked": false})
		return
	}

	id := c.Param("id")

	var like models.LikeDislike
	hasLike := ac.DB.Where("user_id = ? AND artwork_id = ? AND type = ?", userID, id, "like").First(&like).Error == nil

	var dislike models.LikeDislike
	hasDislike := ac.DB.Where("user_id = ? AND artwork_id = ? AND type = ?", userID, id, "dislike").First(&dislike).Error == nil

	c.JSON(http.StatusOK, gin.H{"liked": hasLike, "disliked": hasDislike})
}

func (ac *ArtworkController) AddFavorite(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")
	var artwork models.Artwork
	if err := ac.DB.First(&artwork, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artwork not found"})
		return
	}

	var existingFavorite models.Favorite
	if ac.DB.Where("user_id = ? AND artwork_id = ?", userID, id).First(&existingFavorite).Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already in favorites"})
		return
	}

	favorite := models.Favorite{
		UserID:    userID.(uint),
		ArtworkID: artwork.ID,
	}
	ac.DB.Create(&favorite)

	c.JSON(http.StatusOK, gin.H{"message": "Added to favorites successfully", "favorited": true})
}

func (ac *ArtworkController) RemoveFavorite(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")

	result := ac.DB.Where("user_id = ? AND artwork_id = ?", userID, id).Delete(&models.Favorite{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Favorite not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Removed from favorites successfully", "favorited": false})
}

func (ac *ArtworkController) GetFavoriteStatus(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusOK, gin.H{"favorited": false})
		return
	}

	id := c.Param("id")

	var favorite models.Favorite
	hasFavorite := ac.DB.Where("user_id = ? AND artwork_id = ?", userID, id).First(&favorite).Error == nil

	c.JSON(http.StatusOK, gin.H{"favorited": hasFavorite})
}

func (ac *ArtworkController) GetComments(c *gin.Context) {
	id := c.Param("id")
	var comments []models.Comment

	query := ac.DB.Model(&models.Comment{}).Preload("User").Where("artwork_id = ? AND status = ?", id, 1).Order("created_at DESC")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 10
	}

	var total int64
	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get comments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      comments,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (ac *ArtworkController) AddComment(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")
	var artwork models.Artwork
	if err := ac.DB.First(&artwork, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artwork not found"})
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment := models.Comment{
		UserID:    userID.(uint),
		ArtworkID: artwork.ID,
		Content:   req.Content,
		Status:    1,
	}
	ac.DB.Create(&comment)

	c.JSON(http.StatusOK, gin.H{"message": "Comment added successfully", "comment": comment})
}
