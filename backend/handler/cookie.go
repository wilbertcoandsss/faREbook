package handler

import (
	"net/http"
	"time"
)

func ActionIndex(w http.ResponseWriter, r *http.Request, token string) {
	cookieName := "jwtusertoken"

	c := &http.Cookie{}

	if storedCookie, _ := r.Cookie(cookieName); storedCookie != nil {
		c = storedCookie
	}

	if c.Value == "" {
		c = &http.Cookie{}
		c.Name = cookieName
		c.Value = token
		c.Expires = time.Now().Add(5 * time.Minute)
		http.SetCookie(w, c)
	}

	w.Write([]byte(c.Value))
}
