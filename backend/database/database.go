package database

import (
	"github.com/wilbertcoandssss/training-preweb/graph/model"
	"github.com/wilbertcoandssss/training-preweb/helper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var database *gorm.DB

const defaultDatabase = "host=localhost user=postgres password=Wb24072003 dbname=faREbook port=5432 sslmode=disable TimeZone=Asia/Shanghai"

func GetInstance() *gorm.DB {
	if database == nil {
		dsn := helper.GoDotEnvVariable("DATABASE_URL")

		if dsn == "" {
			dsn = defaultDatabase
		}

		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

		if err != nil {
			panic(err)
		}

		database = db
	}

	return database
}

func MigrateTable() {
	db := GetInstance()

	db.AutoMigrate(&model.User{})
	db.AutoMigrate(&model.Post{})
	db.AutoMigrate(&model.Like{})
	db.AutoMigrate(&model.Comment{})
	db.AutoMigrate(&model.Replies{})
	db.AutoMigrate(&model.Media{})
	db.AutoMigrate(&model.Stories{})
	db.AutoMigrate(&model.Reels{})
	db.AutoMigrate(&model.Friends{})
	db.AutoMigrate(&model.ChatHeader{})
	db.AutoMigrate(&model.ChatDetails{})
	db.AutoMigrate(&model.Group{})
	db.AutoMigrate(&model.GroupMember{})
	db.AutoMigrate(&model.GroupPost{})
	db.AutoMigrate(&model.GroupFiles{})
	db.AutoMigrate(&model.ChatGroupHeader{})
	db.AutoMigrate(&model.ChatGroupDetails{})
	db.AutoMigrate(&model.TaggedUser{})
}
