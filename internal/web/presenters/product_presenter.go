package presenters

import "github.com/gsanta/Personal-Finance-Tracker/internal/db"

type ProductPresenter struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
	MediaAssets []MediaAssetPresenter `json:"mediaAssets"`
}

func NewProductPresenter(p db.Product) ProductPresenter {
	assets := make([]MediaAssetPresenter, 0, len(p.MediaAssets))
	for _, a := range p.MediaAssets {
		assets = append(assets, NewMediaAssetPresenter(a))
	}
	return ProductPresenter{
		ID:          p.ID,
		Name:        p.Name,
		Price:       p.Price,
		Quantity:    p.Quantity,
		MediaAssets: assets,
	}
}
