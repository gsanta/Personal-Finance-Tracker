package db

import (
	"database/sql"
)

type Product struct {
	ID       string
	Name     string
	Price    float64
	Quantity int
}

func GetAllProducts(db *sql.DB, page, itemsPerPage int) ([]Product, int, error) {
	if page < 1 {
		page = 1
	}
	if itemsPerPage < 1 {
		itemsPerPage = 10
	}
	offset := (page - 1) * itemsPerPage

	// Get total count
	var total int
	err := db.QueryRow("SELECT COUNT(*) FROM products").Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated products
	rows, err := db.Query(
		"SELECT id, name, price, quantity FROM products ORDER BY name LIMIT $1 OFFSET $2",
		itemsPerPage, offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		err := rows.Scan(&p.ID, &p.Name, &p.Price, &p.Quantity)
		if err != nil {
			return nil, 0, err
		}
		products = append(products, p)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}
	return products, total, nil
}
