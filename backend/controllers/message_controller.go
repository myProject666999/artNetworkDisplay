package controllers

import (
	"artnetworkdisplay/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

type MessageController struct {
	DB *gorm.DB
}

func (mc *MessageController) List(c *gin.Context) {
	var messages []models.Message
	query := mc.DB.Model(&models.Message{}).Preload("User").Preload("Replies").Where("status = ?", 1)

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
	if err := query.Offset(offset).Limit(pageSize).Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      messages,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (mc *MessageController) Create(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	message := models.Message{
		UserID:  userID.(uint),
		Content: req.Content,
		Status:  1,
	}
	if err := mc.DB.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create message"})
		return
	}

	mc.DB.Preload("User").First(&message, message.ID)
	c.JSON(http.StatusOK, gin.H{"message": "Message created successfully", "data": message})
}

func (mc *MessageController) Get(c *gin.Context) {
	id := c.Param("id")
	var message models.Message

	if err := mc.DB.Preload("User").Preload("Replies").First(&message, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Message not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get message"})
		return
	}

	c.JSON(http.StatusOK, message)
}

func (mc *MessageController) AdminList(c *gin.Context) {
	var messages []models.Message
	query := mc.DB.Model(&models.Message{}).Preload("User").Preload("Replies")

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
	if err := query.Offset(offset).Limit(pageSize).Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      messages,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (mc *MessageController) AdminGet(c *gin.Context) {
	id := c.Param("id")
	var message models.Message

	if err := mc.DB.Preload("User").Preload("Replies").First(&message, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Message not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get message"})
		return
	}

	c.JSON(http.StatusOK, message)
}

func (mc *MessageController) Delete(c *gin.Context) {
	id := c.Param("id")
	var message models.Message

	if err := mc.DB.First(&message, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Message not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get message"})
		return
	}

	if err := mc.DB.Delete(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message deleted successfully"})
}

func (mc *MessageController) Reply(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	id := c.Param("id")
	var message models.Message

	if err := mc.DB.First(&message, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Message not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get message"})
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
		Replier string `json:"replier"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reply := models.MessageReply{
		MessageID: message.ID,
		Content:   req.Content,
		Replier:   req.Replier,
		ReplyBy:   userID.(uint),
	}
	if err := mc.DB.Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reply"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reply created successfully", "reply": reply})
}
