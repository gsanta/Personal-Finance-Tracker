package db

import (
	"database/sql"
)

type Room struct {
	ID      string
	Name    string
	Address string
}

func ListRooms(db *sql.DB) ([]Room, error) {
	rows, err := db.Query(`SELECT id, name, address FROM rooms ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Room
	for rows.Next() {
		var room Room
		if err := rows.Scan(&room.ID, &room.Name, &room.Address); err != nil {
			return nil, err
		}
		out = append(out, room)
	}
	return out, rows.Err()
}
