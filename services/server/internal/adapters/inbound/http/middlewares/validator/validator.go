package validator

import (
	"server/internal/core/domain"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v3"
)

type xvalidator struct {
	validator *validator.Validate
}

var validate = &xvalidator{
	validator: validator.New(),
}

func ValidateBody[T any]() fiber.Handler {
	return func(ctx fiber.Ctx) error {
		var payload = new(T)

		//? Check the structure of the request
		if err := ctx.Bind().Body(payload); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Invalid request body format")
		}

		//? Check the validation of the request's fields
		errors := validate.validateStruct(payload)
		if errors != nil {
			return domain.ValidationErrorGroup{
				Errors: errors,
			}
		}

		//? Save the validated paylod in the context for the next handler
		ctx.Locals("payload", *payload)

		return ctx.Next()
	}
}

func (v *xvalidator) validateStruct(payload interface{}) []domain.ValidationError {
	err := v.validator.Struct(payload)
	if err != nil {
		var errors []domain.ValidationError

		for _, err := range err.(validator.ValidationErrors) {
			errors = append(errors, domain.ValidationError{
				Field: strings.ToLower(err.Field()),
				Tag:   err.Tag(),
				Value: err.Param(),
			})
		}

		return errors
	}

	return nil
}
