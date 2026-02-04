package server

import (
	"server/internal/adapters/inbound/http/handlers"
	"server/internal/adapters/inbound/http/middlewares/validator"
	"server/internal/core/domain"

	"github.com/gofiber/fiber/v3"
)

type Server struct {
	app     *fiber.App
	handler *handlers.WebHandler
}

func NewServer(webHandler *handlers.WebHandler) *Server {
	app := fiber.New(fiber.Config{
		AppName:      "PingPulse Back-End",
		ServerHeader: "Back-End",
		ErrorHandler: handlers.ErrorHandler,
	})
	app.Server().MaxConnsPerIP = 2

	return &Server{
		app:     app,
		handler: webHandler,
	}
}

func (s *Server) SetupRoutes() {
	api := s.app.Group("api")

	hostGroup := api.Group("hosts")
	hostGroup.Get("/all", s.handler.GetHosts)
	hostGroup.Get("/:id", s.handler.GetHost)
	hostGroup.Post("/add", validator.ValidateBody[domain.AddHostsRequest](), s.handler.AddHosts)
	hostGroup.Delete("/delete", validator.ValidateBody[domain.DeleteRequest](), s.handler.DeleteHosts)
	hostGroup.Patch("/update", validator.ValidateBody[domain.UpdateHostsRequest](), s.handler.UpdateHosts)

	configsGroup := api.Group("configs")
	configsGroup.Get("/all", s.handler.GetConfigs)
	hostGroup.Patch("/update", validator.ValidateBody[domain.UpdateConfigsRequest](), s.handler.UpdateConfigs)

	alarmsGroup := api.Group("alarms")
	alarmsGroup.Get("/all", s.handler.GetAlarms)
	alarmsGroup.Get("/:id", s.handler.GetAlarm)
	alarmsGroup.Delete("/delete", validator.ValidateBody[domain.DeleteRequest](), s.handler.DeleteAlarms)
}

func (s *Server) Start() {
	s.app.Listen(":7000")
}
