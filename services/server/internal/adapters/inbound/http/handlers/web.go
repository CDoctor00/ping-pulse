package handlers

import (
	"server/internal/core/domain"
	"server/internal/core/usecase"
	"strconv"

	"github.com/gofiber/fiber/v3"
)

type WebHandler struct {
	ucManager *usecase.Manager
}

func NewWebHandler(ucManager *usecase.Manager) *WebHandler {
	return &WebHandler{
		ucManager: ucManager,
	}
}

/* ------------------------------ GET ------------------------------ */

func (h *WebHandler) GetHost(ctx fiber.Ctx) error {
	hostID, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return domain.UseCaseError{
			Message:    domain.ErrBadRequest,
			StackTrace: err,
		}
	}

	host, errGet := h.ucManager.GetHost(hostID)
	if errGet != nil {
		message := domain.ErrBadRequest
		if errGet.IsInternal {
			message = domain.ErrInternal
		}

		return domain.UseCaseError{
			Message:    message,
			StackTrace: errGet.Error,
		}
	}

	return ctx.Status(fiber.StatusOK).JSON(parseHostDTO(host))
}

func (h *WebHandler) GetHosts(ctx fiber.Ctx) error {
	hostsDTO, err := h.ucManager.GetHosts()
	if err != nil {
		return domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: err,
		}
	}

	var hosts = make([]domain.Host, len(hostsDTO))
	for i, h := range hostsDTO {
		hosts[i] = parseHostDTO(h)
	}

	return ctx.Status(fiber.StatusOK).JSON(hosts)
}

func (h *WebHandler) GetConfigs(ctx fiber.Ctx) error {
	configs, err := h.ucManager.GetConfigs()
	if err != nil {
		return domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: err,
		}
	}

	return ctx.Status(fiber.StatusOK).JSON(configs)
}

func (h *WebHandler) GetAlarm(ctx fiber.Ctx) error {
	alarmID, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return domain.UseCaseError{
			Message:    domain.ErrBadRequest,
			StackTrace: err,
		}
	}

	alarm, errGet := h.ucManager.GetAlarm(alarmID)
	if errGet != nil {
		message := domain.ErrBadRequest
		if errGet.IsInternal {
			message = domain.ErrInternal
		}

		return domain.UseCaseError{
			Message:    message,
			StackTrace: errGet.Error,
		}
	}

	return ctx.Status(fiber.StatusOK).JSON(alarm)
}

func (h *WebHandler) GetAlarms(ctx fiber.Ctx) error {
	alarmsDTO, err := h.ucManager.GetAlarms()
	if err != nil {
		return domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: err,
		}
	}

	var alarms = make([]domain.Alarm, len(alarmsDTO))
	for i, a := range alarmsDTO {
		alarms[i] = parseAlarmDTO(a)
	}

	return ctx.Status(fiber.StatusOK).JSON(alarms)
}

/* ------------------------------ POST ------------------------------ */

func (h *WebHandler) AddHosts(ctx fiber.Ctx) error {
	var data = ctx.Locals("payload").(domain.AddHostsRequest)

	if err := h.ucManager.AddHosts(data.Hosts); err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON("Hosts added")
}

/* ------------------------------ DELETE ------------------------------ */

func (h *WebHandler) DeleteHosts(ctx fiber.Ctx) error {
	var data = ctx.Locals("payload").(domain.DeleteRequest)

	if err := h.ucManager.DeleteHosts(data.IDs); err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON("Hosts deleted")
}

func (h *WebHandler) DeleteAlarms(ctx fiber.Ctx) error {
	var data = ctx.Locals("payload").(domain.DeleteRequest)

	if err := h.ucManager.DeleteAlarms(data.IDs); err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON("Alarms deleted")
}

/* ------------------------------ PATCH ------------------------------ */

func (h *WebHandler) UpdateHosts(ctx fiber.Ctx) error {
	var data = ctx.Locals("payload").(domain.UpdateHostsRequest)

	var hosts = make([]domain.HostDTO, len(data.Hosts))
	for i, h := range data.Hosts {
		hosts[i] = parseHostAPI(h)
	}

	if err := h.ucManager.UpdateHosts(hosts); err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON("Hosts updated")
}

func (h *WebHandler) UpdateConfigs(ctx fiber.Ctx) error {
	var data = ctx.Locals("payload").(domain.UpdateConfigsRequest)

	if err := h.ucManager.UpdateConfigs(data.Configs); err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON("Hosts updated")
}
