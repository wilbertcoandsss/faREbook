package graph

import (
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

//go:generate go run github.com/99designs/gqlgen generate

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB    *gorm.DB
	Conns map[string]*websocket.Conn
}
