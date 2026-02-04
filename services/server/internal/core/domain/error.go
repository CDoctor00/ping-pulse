package domain

import "errors"

type ServiceError struct {
	IsInternal bool
	Error      error
}

var (
	ErrNotFound   = errors.New("Resource not found")
	ErrBadRequest = errors.New("The given data is not correct")
	ErrInternal   = errors.New("Internal Server Error")
)

type UseCaseError struct {
	Message    error
	StackTrace error
}

func (e UseCaseError) Error() string {
	return e.Message.Error()
}

type ValidationError struct {
	Field string `json:"field"`
	Tag   string `json:"tag"`
	Value string `json:"value,omitempty"`
}

type ValidationErrorGroup struct {
	Errors []ValidationError `json:"errors"`
}

func (v ValidationErrorGroup) Error() string {
	return "Validation failed"
}
