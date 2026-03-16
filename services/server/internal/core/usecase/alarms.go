package usecase

import (
	"database/sql"
	"errors"
	"fmt"
	"server/internal/core/domain"
)

/* ------------------------------ GET ------------------------------ */

func (m *Manager) GetAlarm(id int) (domain.AlarmDTO, error) {
	alarm, err := m.repository.GetAlarmByID(id)
	if err != nil {
		if errors.Is(errors.Unwrap(err), sql.ErrNoRows) {
			return domain.AlarmDTO{}, domain.UseCaseError{
				Message:    domain.ErrBadRequest,
				StackTrace: fmt.Errorf("usecase.GetAlarm: %w", err),
			}
		}

		return domain.AlarmDTO{}, domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.GetAlarm: %w", err),
		}
	}

	return alarm, nil
}

func (m *Manager) GetAlarms() ([]domain.AlarmDTO, error) {
	alarms, err := m.repository.GetAlarms()
	if err != nil {
		return nil, domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.GetAlarms: %w", err),
		}
	}

	return alarms, nil
}

/* ------------------------------ DELETE ------------------------------ */

func (m *Manager) DeleteAlarms(alarmsID []int) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	err := m.repository.DeleteAlarms(alarmsID)
	if err != nil {
		return domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.DeleteAlarms: %w", err),
		}
	}

	return nil
}
