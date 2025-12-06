package db

import (
	"database/sql"
)

type UserWithPassword struct {
	ID        string
	Email     string
	Password  string
	CreatedAt string
}

type User struct {
	ID    string
	Email string
}

func InsertUser(db *sql.DB, user *UserWithPassword) error {
	query := `INSERT INTO users (email, password) VALUES ($1,$2) RETURNING id, created_at`
	return db.QueryRow(query, user.Email, user.Password).Scan(&user.ID, &user.CreatedAt)
}

func GetUserByEmail(db *sql.DB, email string) (*User, error) {
	query := `SELECT id, email FROM users WHERE email = $1`

	user := &User{}
	err := db.QueryRow(query, email).Scan(&user.ID, &user.Email)
	if err != nil {
		return nil, err
	}

	return user, nil
}
