package controllers

import (
	"artnetworkdisplay/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

type AnnouncementController struct {
	DB *gorm.DB
}

func (ac *AnnouncementController) List(c *gin.Context) {
	var announcements []models.Announcement
	query := ac.DB.Model(&models.Announcement{}).Where("status = ?", 1)

	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query = query.Order("is_top DESC, created_at DESC")

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
	if err := query.Offset(offset).Limit(pageSize).Find(&announcements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get announcements"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      announcements,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (ac *AnnouncementController) Get(c *gin.Context) {
	id := c.Param("id")
	var announcement models.Announcement

	if err := ac.DB.First(&announcement, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Announcement not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get announcement"})
		return
	}

	ac.DB.Model(&announcement).Update("views", announcement.Views+1)
	announcement.Views++

	c.JSON(http.StatusOK, announcement)
}

func (ac *AnnouncementController) Create(c *gin.Context) {
	var announcement models.Announcement
	if err := c.ShouldBindJSON(&announcement); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	announcement.Status = 1
	if err := ac.DB.Create(&announcement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create announcement"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Announcement created successfully", "announcement": announcement})
}

func (ac *AnnouncementController) Update(c *gin.Context) {
	id := c.Param("id")
	var announcement models.Announcement

	if err := ac.DB.First(&announcement, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Announcement not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get announcement"})
		return
	}

	var req models.Announcement
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Title != "" {
		announcement.Title = req.Title
	}
	if req.Content != "" {
		announcement.Content = req.Content
	}
	if req.Author != "" {
		announcement.Author = req.Author
	}
	announcement.IsTop = req.IsTop
	announcement.Status = req.Status

	if err := ac.DB.Save(&announcement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update announcement"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Announcement updated successfully", "announcement": announcement})
}

func (ac *AnnouncementController) Delete(c *gin.Context) {
	id := c.Param("id")
	var announcement models.Announcement

	if err := ac.DB.First(&announcement, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Announcement not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get announcement"})
		return
	}

	if err := ac.DB.Delete(&announcement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete announcement"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Announcement deleted successfully"})
}

func (ac *AnnouncementController) AdminList(c *gin.Context) {
	var announcements []models.Announcement
	query := ac.DB.Model(&models.Announcement{})

	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query = query.Order("is_top DESC, created_at DESC")

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
	if err := query.Offset(offset).Limit(pageSize).Find(&announcements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get announcements"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      announcements,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}
