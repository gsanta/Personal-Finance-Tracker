package web

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gsanta/Personal-Finance-Tracker/internal/db"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web"
	"github.com/gsanta/Personal-Finance-Tracker/internal/web/presenters"
)

// ProductsHandlerGin handles the products page (Gin style)
func ProductsHandlerGin(c *gin.Context) {
	log.Printf("[ProductsHandlerGin] called: %s %s from %s", c.Request.Method, c.Request.URL.Path, c.Request.RemoteAddr)
	web.EnsureTemplates()

	page, itemsPerPage := web.ParsePaginationParams(c.Request)

	products, total, err := db.GetAllProductsWithAssets(db.DB, page, itemsPerPage)

	if err != nil {
		log.Printf("Error getting products: %v", err)
		c.String(http.StatusInternalServerError, "Internal server error")
		return
	}

	if len(products) > 0 {
		log.Printf("[ProductsHandlerGin] first product media assets count: %d", len(products[0].MediaAssets))
	}

	var presentedProducts []presenters.ProductPresenter
	for _, p := range products {
		presentedProducts = append(presentedProducts, presenters.NewProductPresenter(p))
	}

	productsPresenter := presenters.PaginatedItemsPresenter{
		Items:      presentedProducts,
		TotalCount: total,
	}

	// Start with handler-specific props
	pageProps := map[string]interface{}{
		"products": productsPresenter,
	}

	// Merge in common authentication fields
	web.PutCurrentUserOnPagePropsAndReturnUser(c, pageProps)

	web.RenderPage(c.Writer, c.Request, pageProps)
}
