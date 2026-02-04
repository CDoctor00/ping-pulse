package usecase

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"server/internal/core/domain"
	"time"
)

/* ------------------------------ GET ------------------------------ */

func (m *Manager) GetHost(hostID int) (domain.HostDTO, *domain.ServiceError) {
	host, err := m.repository.GetHost(hostID)
	if err != nil {
		return domain.HostDTO{}, &domain.ServiceError{
			IsInternal: !errors.Is(errors.Unwrap(err), sql.ErrNoRows),
			Error:      fmt.Errorf("usecase.GetHost: %w", err),
		}

	}

	return host, nil
}

func (m *Manager) GetHosts() ([]domain.HostDTO, error) {
	hosts, err := m.repository.GetHosts()
	if err != nil {
		return nil, fmt.Errorf("usecase.GetHosts: %w", err)
	}

	return hosts, nil
}

/* ------------------------------ POST ------------------------------ */

func (m *Manager) AddHosts(hosts []domain.NewHost) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	err := m.repository.AddHosts(hosts)
	if err != nil {
		return fmt.Errorf("usecase.AddHosts: %w", err)
	}

	body, err := json.Marshal(
		domain.ConfigsEvent{
			EventType: "network_updated",
			Timestamp: time.Now().Format(time.RFC3339),
		})
	if err != nil {
		return fmt.Errorf("usecase.AddHosts: %w", err)
	}

	m.eventProducer.PublishEvent(body)

	return nil
}

/* ------------------------------ DELETE ------------------------------ */

func (m *Manager) DeleteHosts(hostsID []int) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	err := m.repository.DeleteHosts(hostsID)
	if err != nil {
		return fmt.Errorf("usecase.DeleteHosts: %w", err)
	}

	body, err := json.Marshal(
		domain.ConfigsEvent{
			EventType: "network_updated",
			Timestamp: time.Now().Format(time.RFC3339),
		})
	if err != nil {
		return fmt.Errorf("usecase.DeleteHosts: %w", err)
	}

	m.eventProducer.PublishEvent(body)

	return nil
}

/* ------------------------------ PATCH ------------------------------ */

func (m *Manager) UpdateHosts(hosts []domain.HostDTO) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	err := m.repository.UpdateHosts(hosts)
	if err != nil {
		return fmt.Errorf("usecase.UpdateHosts: %w", err)
	}

	body, err := json.Marshal(
		domain.ConfigsEvent{
			EventType: "network_updated",
			Timestamp: time.Now().Format(time.RFC3339),
		})
	if err != nil {
		return fmt.Errorf("usecase.UpdateHosts: %w", err)
	}

	m.eventProducer.PublishEvent(body)

	return nil
}
