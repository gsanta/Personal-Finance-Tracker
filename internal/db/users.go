package db

import (
	"database/sql"
)

type User struct {
	ID        string
	Email     string
	Password  string
	CreatedAt string
}

func InsertUser(db *sql.DB, user *User) error {
	query := `INSERT INTO users (email, password) VALUES ($1,$2) RETURNING id, created_at`
	return db.QueryRow(query, user.Email, user.Password).Scan(&user.ID, &user.CreatedAt)
}
