package api

import (
	"net/http"

	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web/presenters"
)

func ProductsHandler(w http.ResponseWriter, r *http.Request) {
	page, itemsPerPage := web.ParsePaginationParams(r)

	products, total, err := db.GetAllProductsWithAssets(db.DB, page, itemsPerPage)

	if err != nil {
		// handle error (e.g., log or return HTTP 500)
		return
	}

	var presentedProducts []presenters.ProductPresenter
	for _, p := range products {
		presentedProducts = append(presentedProducts, presenters.NewProductPresenter(p))
	}

	productsPresenter := presenters.PaginatedItemsPresenter{
		Items:      presentedProducts,
		TotalCount: total,
	}

	web.WriteJSON(w, http.StatusAccepted, productsPresenter)
}
