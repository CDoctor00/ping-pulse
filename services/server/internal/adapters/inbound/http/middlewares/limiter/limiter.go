package limiter

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/limiter"
)

func New(maxRequests int, window time.Duration) fiber.Handler {
	return limiter.New(limiter.Config{
		Max:               maxRequests,
		Expiration:        window,
		LimiterMiddleware: limiter.FixedWindow{},
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"status":  "error",
				"message": "Too many requests. Slow down, breathe, and try again later.",
				"code":    429,
			})
		},
	})
}
