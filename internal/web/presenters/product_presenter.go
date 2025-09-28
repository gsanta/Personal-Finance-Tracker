package presenters

import "github.com/gsanta/Personal-Finance-Tracker/internal/db"

type ProductPresenter struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
}

func NewProductPresenter(p db.Product) ProductPresenter {
	return ProductPresenter{
		ID:       p.ID,
		Name:     p.Name,
		Price:    p.Price,
		Quantity: p.Quantity,
	}
}
