package middleware

import (
	"net/http"
	"time"

	"github.com/go-chi/httprate"
)

func RateLimiterPerHour(limitPerHour int) func(http.Handler) http.Handler {
	return httprate.Limit(
		limitPerHour,
		1*time.Hour,
		httprate.WithKeyFuncs(httprate.KeyByIP),
		httprate.WithLimitHandler(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"error": "Too many requests. Please try again later."}`))
		}),
	)
}

func RateLimiterPerMinute(limitPerMinute int) func(http.Handler) http.Handler {
	return httprate.Limit(
		limitPerMinute,
		1*time.Minute,
		httprate.WithKeyFuncs(httprate.KeyByIP),
		httprate.WithLimitHandler(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"error": "Too many requests. Please try again later."}`))
		}),
	)
}
