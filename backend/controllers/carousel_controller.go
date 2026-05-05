package controllers

import (
	"artnetworkdisplay/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

type CarouselController struct {
	DB *gorm.DB
}

func (cc *CarouselController) List(c *gin.Context) {
	var carousels []models.Carousel
	if err := cc.DB.Where("status = ?", 1).Order("sort ASC, id ASC").Find(&carousels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get carousels"})
		return
	}
	c.JSON(http.StatusOK, carousels)
}

func (cc *CarouselController) Create(c *gin.Context) {
	var carousel models.Carousel
	if err := c.ShouldBindJSON(&carousel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	carousel.Status = 1
	if err := cc.DB.Create(&carousel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create carousel"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Carousel created successfully", "carousel": carousel})
}

func (cc *CarouselController) Get(c *gin.Context) {
	id := c.Param("id")
	var carousel models.Carousel

	if err := cc.DB.First(&carousel, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Carousel not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get carousel"})
		return
	}

	c.JSON(http.StatusOK, carousel)
}

func (cc *CarouselController) Update(c *gin.Context) {
	id := c.Param("id")
	var carousel models.Carousel

	if err := cc.DB.First(&carousel, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Carousel not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get carousel"})
		return
	}

	var req models.Carousel
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Title != "" {
		carousel.Title = req.Title
	}
	if req.Image != "" {
		carousel.Image = req.Image
	}
	if req.Link != "" {
		carousel.Link = req.Link
	}
	carousel.Sort = req.Sort
	carousel.Status = req.Status

	if err := cc.DB.Save(&carousel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update carousel"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Carousel updated successfully", "carousel": carousel})
}

func (cc *CarouselController) Delete(c *gin.Context) {
	id := c.Param("id")
	var carousel models.Carousel

	if err := cc.DB.First(&carousel, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Carousel not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get carousel"})
		return
	}

	if err := cc.DB.Delete(&carousel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete carousel"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Carousel deleted successfully"})
}

func (cc *CarouselController) AdminList(c *gin.Context) {
	var carousels []models.Carousel
	if err := cc.DB.Order("sort ASC, id ASC").Find(&carousels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get carousels"})
		return
	}
	c.JSON(http.StatusOK, carousels)
}
