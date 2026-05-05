package controllers

import (
	"artnetworkdisplay/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

type AdminArtworkController struct {
	DB *gorm.DB
}

func (aac *AdminArtworkController) List(c *gin.Context) {
	var artworks []models.Artwork
	query := aac.DB.Model(&models.Artwork{}).Preload("Category")

	if categoryID := c.Query("category_id"); categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("title LIKE ? OR artist LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	query = query.Order("created_at DESC")

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

func (aac *AdminArtworkController) Get(c *gin.Context) {
	id := c.Param("id")
	var artwork models.Artwork

	if err := aac.DB.Preload("Category").First(&artwork, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Artwork not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get artwork"})
		return
	}

	c.JSON(http.StatusOK, artwork)
}

func (aac *AdminArtworkController) Create(c *gin.Context) {
	var artwork models.Artwork
	if err := c.ShouldBindJSON(&artwork); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	artwork.Status = 1
	if err := aac.DB.Create(&artwork).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create artwork"})
		return
	}

	aac.DB.Preload("Category").First(&artwork, artwork.ID)
	c.JSON(http.StatusOK, gin.H{"message": "Artwork created successfully", "artwork": artwork})
}

func (aac *AdminArtworkController) Update(c *gin.Context) {
	id := c.Param("id")
	var artwork models.Artwork

	if err := aac.DB.First(&artwork, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Artwork not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get artwork"})
		return
	}

	var req struct {
		Title       string  `json:"title"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
		Image       string  `json:"image"`
		CategoryID  uint    `json:"category_id"`
		Artist      string  `json:"artist"`
		Year        int     `json:"year"`
		Material    string  `json:"material"`
		Dimensions  string  `json:"dimensions"`
		Status      int     `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Title != "" {
		artwork.Title = req.Title
	}
	if req.Description != "" {
		artwork.Description = req.Description
	}
	if req.Price != 0 {
		artwork.Price = req.Price
	}
	if req.Image != "" {
		artwork.Image = req.Image
	}
	if req.CategoryID != 0 {
		artwork.CategoryID = req.CategoryID
	}
	if req.Artist != "" {
		artwork.Artist = req.Artist
	}
	if req.Year != 0 {
		artwork.Year = req.Year
	}
	if req.Material != "" {
		artwork.Material = req.Material
	}
	if req.Dimensions != "" {
		artwork.Dimensions = req.Dimensions
	}
	if req.Status != 0 {
		artwork.Status = req.Status
	}

	if err := aac.DB.Save(&artwork).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update artwork"})
		return
	}

	aac.DB.Preload("Category").First(&artwork, artwork.ID)
	c.JSON(http.StatusOK, gin.H{"message": "Artwork updated successfully", "artwork": artwork})
}

func (aac *AdminArtworkController) Delete(c *gin.Context) {
	id := c.Param("id")
	var artwork models.Artwork

	if err := aac.DB.First(&artwork, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Artwork not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get artwork"})
		return
	}

	if err := aac.DB.Delete(&artwork).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete artwork"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Artwork deleted successfully"})
}

func (aac *AdminArtworkController) GetComments(c *gin.Context) {
	id := c.Param("id")
	var comments []models.Comment

	query := aac.DB.Model(&models.Comment{}).Preload("User").Where("artwork_id = ?", id).Order("created_at DESC")

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

func (aac *AdminArtworkController) DeleteComment(c *gin.Context) {
	id := c.Param("id")
	var comment models.Comment

	if err := aac.DB.First(&comment, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get comment"})
		return
	}

	if err := aac.DB.Delete(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}
