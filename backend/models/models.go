package models

import (
	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
	"time"
)

func Migrate(db *gorm.DB) error {
	if err := db.AutoMigrate(
		&User{},
		&Category{},
		&Artwork{},
		&Announcement{},
		&Message{},
		&Carousel{},
		&Favorite{},
		&Comment{},
		&LikeDislike{},
		&MessageReply{},
	).Error; err != nil {
		return err
	}

	createDefaultAdmin(db)
	return nil
}

func createDefaultAdmin(db *gorm.DB) {
	var count int
	db.Model(&User{}).Where("role = ?", "admin").Count(&count)
	if count == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		admin := User{
			Username: "admin",
			Password: string(hashedPassword),
			Email:    "admin@example.com",
			Role:     "admin",
			Nickname: "系统管理员",
		}
		db.Create(&admin)
	}
}

type User struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Username  string     `gorm:"unique_index;not null" json:"username"`
	Password  string     `gorm:"not null" json:"-"`
	Email     string     `gorm:"unique_index;not null" json:"email"`
	Role      string     `gorm:"default:'user'" json:"role"`
	Nickname  string     `json:"nickname"`
	Avatar    string     `json:"avatar"`
	Phone     string     `json:"phone"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

func (u *User) BeforeSave() {
	if u.Role == "" {
		u.Role = "user"
	}
}

type Category struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Name      string     `gorm:"not null;unique" json:"name"`
	Icon      string     `json:"icon"`
	Sort      int        `gorm:"default:0" json:"sort"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	Artworks  []Artwork  `gorm:"foreignkey:CategoryID" json:"-"`
}

type Artwork struct {
	ID          uint       `gorm:"primary_key" json:"id"`
	Title       string     `gorm:"not null" json:"title"`
	Description string     `json:"description"`
	Price       float64    `json:"price"`
	Image       string     `json:"image"`
	CategoryID  uint       `json:"category_id"`
	Category    Category   `gorm:"foreignkey:CategoryID" json:"category,omitempty"`
	Artist      string     `json:"artist"`
	Year        int        `json:"year"`
	Material    string     `json:"material"`
	Dimensions  string     `json:"dimensions"`
	Views       int        `gorm:"default:0" json:"views"`
	Likes       int        `gorm:"default:0" json:"likes"`
	Dislikes    int        `gorm:"default:0" json:"dislikes"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Comments    []Comment  `gorm:"foreignkey:ArtworkID" json:"-"`
	Favorites   []Favorite `gorm:"foreignkey:ArtworkID" json:"-"`
}

type Announcement struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Title     string     `gorm:"not null" json:"title"`
	Content   string     `gorm:"type:text;not null" json:"content"`
	Author    string     `json:"author"`
	Views     int        `gorm:"default:0" json:"views"`
	IsTop     bool       `gorm:"default:false" json:"is_top"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type Message struct {
	ID          uint           `gorm:"primary_key" json:"id"`
	UserID      uint           `json:"user_id"`
	User        User           `gorm:"foreignkey:UserID" json:"user,omitempty"`
	Content     string         `gorm:"type:text;not null" json:"content"`
	Status      int            `gorm:"default:1" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Replies     []MessageReply `gorm:"foreignkey:MessageID" json:"replies,omitempty"`
}

type MessageReply struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	MessageID uint       `json:"message_id"`
	Content   string     `gorm:"type:text;not null" json:"content"`
	Replier   string     `json:"replier"`
	ReplyBy   uint       `json:"reply_by"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type Carousel struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Title     string     `gorm:"not null" json:"title"`
	Image     string     `gorm:"not null" json:"image"`
	Link      string     `json:"link"`
	Sort      int        `gorm:"default:0" json:"sort"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type Favorite struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	UserID    uint       `gorm:"not null;unique_index:idx_user_artwork" json:"user_id"`
	ArtworkID uint       `gorm:"not null;unique_index:idx_user_artwork" json:"artwork_id"`
	Artwork   Artwork    `gorm:"foreignkey:ArtworkID" json:"artwork,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}

type Comment struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	UserID    uint       `json:"user_id"`
	User      User       `gorm:"foreignkey:UserID" json:"user,omitempty"`
	ArtworkID uint       `json:"artwork_id"`
	Content   string     `gorm:"type:text;not null" json:"content"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type LikeDislike struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	UserID    uint      `gorm:"not null;unique_index:idx_user_artwork_type" json:"user_id"`
	ArtworkID uint      `gorm:"not null;unique_index:idx_user_artwork_type" json:"artwork_id"`
	Type      string    `gorm:"not null;unique_index:idx_user_artwork_type" json:"type"`
	CreatedAt time.Time `json:"created_at"`
}
