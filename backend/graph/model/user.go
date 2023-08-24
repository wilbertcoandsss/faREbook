package model

import (
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID         string `json:"id"`
	Firstname  string `json:"name"`
	Surname    string `json:"email"`
	Email      string `json:"username" gorm:"unique"`
	Password   string `json:"password"`
	Dob        string `json:"dob"`
	Verifcode  string `json:"verifcode"`
	Isverified bool   `json:"isverif"`
	Gender     string `json:"gender"`
	Profilepic string `json:"profilepic"`
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
