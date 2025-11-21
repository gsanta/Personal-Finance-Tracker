package auth

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	ab "github.com/aarondl/authboss/v3"
)

// APIResponder mirrors defaults.Responder but coerces HTTP codes for API-style
// requests (JSON) so failures return appropriate 4xx instead of 200.
// This keeps SPA clients from treating failures as success.
//
// Rules when incoming code is 0 or 200 (modules often pass 200):
// - If request path contains "/login" and this is an error page => 401
// - If request path contains "/register" and this is an error page => 400
// - Otherwise leave as-is.
//
// We detect an error by page == "error" or data["status"] == "failure".
// For non-API requests we do not change the status code.
//
// Rendering is delegated to the configured Renderer (JSONRenderer in our setup).
type APIResponder struct {
	Renderer ab.Renderer
}

func NewAPIResponder(renderer ab.Renderer) *APIResponder {
	return &APIResponder{Renderer: renderer}
}

type APIResponse struct {
	Error  string `json:"error"`
	Status string `json:"status"`
	Code   string `json:"code,omitempty"`
}

func (r *APIResponder) Respond(w http.ResponseWriter, req *http.Request, code int, page string, data ab.HTMLData) error {
	// Merge context data like defaults.Responder
	if ctxData := req.Context().Value(ab.CTXKeyData); ctxData != nil {
		if data == nil {
			data = ab.HTMLData{}
		}
		data.Merge(ctxData.(ab.HTMLData))
	}

	// Coerce codes for failures regardless of Content-Type so browser form posts also get proper 4xx.
	if code == 0 || code == http.StatusOK {
		// Determine if this is an error
		isError := page == "error"
		if !isError && data != nil {
			if v, ok := data["status"]; ok {
				if s, ok2 := v.(string); ok2 && s == "failure" {
					isError = true
				}
			}
		}
		if isError {
			path := req.URL.Path
			if strings.Contains(path, "/login") {
				code = http.StatusUnauthorized // 401
			} else if strings.Contains(path, "/register") {
				code = http.StatusBadRequest // 400
			} else {
				code = http.StatusBadRequest
			}
		}
	}

	if data == nil {
		data = ab.HTMLData{}
	}

	rendered, mime, err := r.Renderer.Render(req.Context(), page, data)
	if err != nil {
		return err
	}

	errorInfo, err := handleFailure(data)
	if err != nil {
		return err
	}

	if errorInfo != nil && errorInfo.Code != 0 {
		code = errorInfo.Code
		data["code"] = errorInfo.ErrorCode
	}

	rendered, mime, err = r.Renderer.Render(req.Context(), page, data)
	if err != nil {
		return err
	}

	if len(rendered) != 0 {
		w.Header().Set("Content-Type", mime)
	}

	if code == 0 {
		code = http.StatusOK
	}

	w.WriteHeader(code)
	_, err = w.Write(rendered)
	return err
}

type ErrorInfo struct {
	Code      int
	ErrorCode string
}

func handleFailure(data ab.HTMLData) (*ErrorInfo, error) {
	var response APIResponse

	prettyJSON, _ := json.MarshalIndent(data, "", "  ")

	if err := json.Unmarshal(prettyJSON, &response); err != nil {
		log.Printf("Error parsing JSON: %v", err)
		return nil, err
	}

	var errInfo ErrorInfo

	log.Printf("APIResponder: response=%+v", response)

	if response.Status == "failure" {
		errInfo.Code = http.StatusBadRequest

		// Add error code for specific errors
		if response.Error == "Invalid Credentials" {
			// Modify the data to include the error code
			if data == nil {
				data = ab.HTMLData{}
			}
			errInfo.ErrorCode = "ERR_INVALID_CREDENTIALS"
		}
	}

	return &errInfo, nil
}
