package config

import (
	"fmt"
	"os"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

type Config struct {
	DBType string
	DBName string
	JWTSecret string
}

var AppConfig *Config

func LoadConfig() {
	AppConfig = &Config{
		DBType:    "sqlite3",
		DBName:    "artnetwork.db",
		JWTSecret: getEnv("JWT_SECRET", "your-secret-key-here-change-in-production"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func InitDB() (*gorm.DB, error) {
	connectionString := AppConfig.DBName
	db, err := gorm.Open(AppConfig.DBType, connectionString)
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %v", err)
	}

	db.DB().SetMaxIdleConns(10)
	db.DB().SetMaxOpenConns(100)
	db.LogMode(true)

	return db, nil
}
