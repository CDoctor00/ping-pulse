package inbound

import (
	"github.com/gofiber/fiber/v3"
)

type WebHandler interface {
	AddHosts(ctx fiber.Ctx) error
	GetHosts(ctx fiber.Ctx) error
	GetHost(ctx fiber.Ctx) error
	UpdateHosts(ctx fiber.Ctx) error
	DeleteHosts(ctx fiber.Ctx) error
	SwitchMaintenanceHost(ctx fiber.Ctx) error

	GetConfigs(ctx fiber.Ctx) error
	UpdateConfigs(ctx fiber.Ctx) error

	GetAlarm(ctx fiber.Ctx) error
	GetAlarms(ctx fiber.Ctx) error
	DeleteAlarms(ctx fiber.Ctx) error
}
