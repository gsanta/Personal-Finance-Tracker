package web

import (
	"log"
	"net/http"
	"sync"

	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web/presenters"
)

var (
	tplOnce sync.Once
)

func ProductsHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("[ProductsHandler] called: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
	tplOnce.Do(web.LoadTemplates)

	page, itemsPerPage := web.ParsePaginationParams(r)

	products, total, err := db.GetAllProducts(db.DB, page, itemsPerPage)

	if err != nil {
		// handle error (e.g., log or return HTTP 500)
		return
	}

	var presentedProducts []presenters.ProductPresenter
	for _, p := range products {
		presentedProducts = append(presentedProducts, presenters.NewProductPresenter(p))
	}

	log.Printf("[ProductsHandler] called: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)

	productsPresenter := presenters.PaginatedItemsPresenter{
		Items:      presentedProducts,
		TotalCount: total,
	}
	pageProps := map[string]interface{}{
		"products": productsPresenter,
	}

	web.RenderPage(w, r, pageProps)
}
