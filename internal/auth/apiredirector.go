package auth

import (
	"net/http"
	"strings"

	ab "github.com/aarondl/authboss/v3"
)

// APIRedirector implements authboss.Redirector but returns JSON with
// appropriate HTTP codes (200/4xx) instead of issuing HTTP redirects.
// This ensures SPA/XHR clients do not receive 30x responses that browsers may
// auto-follow with the original method.
type APIRedirector struct {
	Renderer ab.Renderer
}

// Redirect writes a JSON payload describing the redirect target and returns
// an HTTP status code based on success/failure. It never issues an HTTP redirect.
func (r APIRedirector) Redirect(w http.ResponseWriter, req *http.Request, ro ab.RedirectOptions) error {
	path := ro.RedirectPath

	status := "success"
	message := ""
	if len(ro.Success) != 0 {
		message = ro.Success
	}
	if len(ro.Failure) != 0 {
		status = "failure"
		message = ro.Failure
	}

	// Determine HTTP status code
	code := ro.Code
	if code == 0 {
		if status == "failure" {
			if strings.Contains(req.URL.Path, "/login") {
				code = http.StatusUnauthorized // 401 for login failures
			} else {
				code = http.StatusBadRequest // 400 for other failures (e.g., validation)
			}
		} else {
			code = http.StatusOK // success
		}
	}

	data := ab.HTMLData{
		"location": path,
		"status":   status,
	}
	if len(message) != 0 {
		data["message"] = message
	}

	body, mime, err := r.Renderer.Render(req.Context(), "redirect", data)
	if err != nil {
		return err
	}
	if len(body) != 0 {
		w.Header().Set("Content-Type", mime)
	}
	w.WriteHeader(code)
	_, err = w.Write(body)
	return err
}
