package handlers

import (
	"errors"
	"server/internal/core/domain"

	"github.com/gofiber/fiber/v3"
)

func ErrorHandler(ctx fiber.Ctx, err error) error {
	var code = fiber.StatusInternalServerError
	var message = domain.ErrInternal.Error()
	var details interface{} = nil

	//? Handle fiber errors (es. 404, 405, etc.)
	var fibErr *fiber.Error
	if errors.As(err, &fibErr) {
		code = fibErr.Code
		message = fibErr.Message
	}

	//? Handle validation errors
	var valErr domain.ValidationErrorGroup
	if errors.As(err, &valErr) {
		code = fiber.StatusUnprocessableEntity
		message = "Validation Failed"
		details = valErr.Errors
	}

	//? Handle business logics errors
	var ucErr domain.UseCaseError
	if errors.As(err, &ucErr) {
		switch {
		case errors.Is(ucErr.Message, domain.ErrNotFound):
			code = fiber.StatusNotFound
		case errors.Is(ucErr.Message, domain.ErrBadRequest):
			code = fiber.StatusBadRequest
			//? internal error doesn need case, is the default
		}
		message = ucErr.Message.Error()
		details = ucErr.StackTrace.Error()
	}

	return ctx.Status(code).JSON(
		domain.ResponseError{
			Error:   message,
			Details: details,
		})
}
