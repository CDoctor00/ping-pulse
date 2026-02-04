package inbound

import (
	"github.com/gofiber/fiber/v3"
)

// TODO delete-useless
type WebHandler interface {
	AddHosts(ctx fiber.Ctx) error
	GetHosts(ctx fiber.Ctx) error
	GetHost(ctx fiber.Ctx) error
	UpdateHosts(ctx fiber.Ctx) error
	DeleteHosts(ctx fiber.Ctx) error

	GetConfigs(ctx fiber.Ctx) error
	UpdateConfigs(ctx fiber.Ctx) error

	GetAlarms(ctx fiber.Ctx) error
	DeleteAlarms(ctx fiber.Ctx) error
}
