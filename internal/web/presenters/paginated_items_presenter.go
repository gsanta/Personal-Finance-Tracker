package presenters

type PaginatedItemsPresenter struct {
	Items      interface{} `json:"items"`
	TotalCount int         `json:"totalCount"`
}
