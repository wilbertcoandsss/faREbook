package helper

import (
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
)

// func JwtValidate(ctx context.Context, token string) (*jwt.Token, error) {
// 	return jwt.ParseWithClaims(token, &JwtCustom{}, func(t *jwt.Token) (interface{}, error) {
// 		if _, success := t.Method.(*jwt.SigningMethodHMAC); !success {
// 			return nil, fmt.Errorf("jwt token ngaco")
// 		}
// 		return jwtSecret, nil
// 	})
// }

func GenerateToken(userID string) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)

	// Set claims, e.g., user ID and expiration time.
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = userID
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix() // Set token to expire in 24 hours

	tokenString, err := token.SignedString([]byte(GoDotEnvVariable("jwtSecret")))

	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func ValidateToken(tokenString string) (string, error) {

	tokenParse, errParse := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(GoDotEnvVariable("jwtSecret")), nil
	})

	if errParse != nil {
		return "", errParse
	}

	newClaims := tokenParse.Claims.(jwt.MapClaims)
	userId := newClaims["user_id"].(string)

	fmt.Print("Parse token", userId)

	return userId, errParse
}
