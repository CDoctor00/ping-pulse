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

func (m *Manager) GetHost(hostID int) (domain.HostDTO, error) {
	host, err := m.repository.GetHost(hostID)
	if err != nil {
		if errors.Is(errors.Unwrap(err), sql.ErrNoRows) {
			return domain.HostDTO{}, domain.UseCaseError{
				Message:    domain.ErrBadRequest,
				StackTrace: fmt.Errorf("usecase.GetHost: %w", err),
			}
		}
		return domain.HostDTO{}, domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.GetHost: %w", err),
		}

	}

	return host, nil
}

func (m *Manager) GetHosts() ([]domain.HostDTO, error) {
	hosts, err := m.repository.GetHosts()
	if err != nil {
		return nil, domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.GetHosts: %w", err),
		}
	}

	return hosts, nil
}

/* ------------------------------ POST ------------------------------ */

func (m *Manager) AddHosts(hosts []domain.NewHost) error {
	//? Check existing resources
	for _, host := range hosts {
		exists, err := m.repository.IsNameAlreadyUsed(host.Name)
		if err != nil {
			return domain.UseCaseError{
				Message:    domain.ErrInternal,
				StackTrace: fmt.Errorf("usecase.AddHosts: %w", err),
			}
		}
		if exists {
			return domain.UseCaseError{
				Message:    domain.ErrConflict,
				StackTrace: fmt.Errorf("The name '%s' already exists", host.Name),
			}
		}

		exists, err = m.repository.IpAddressExists(host.IPAddress)
		if err != nil {
			return domain.UseCaseError{
				Message:    domain.ErrInternal,
				StackTrace: fmt.Errorf("usecase.AddHosts: %w", err),
			}
		}
		if exists {
			return domain.UseCaseError{
				Message:    domain.ErrConflict,
				StackTrace: fmt.Errorf("The IP Address '%s' already exists", host.IPAddress),
			}
		}

		if host.ParentIP != nil {
			exists, err = m.repository.IpAddressExists(*host.ParentIP)
			if err != nil {
				return domain.UseCaseError{
					Message:    domain.ErrInternal,
					StackTrace: fmt.Errorf("usecase.AddHosts: %w", err),
				}
			}
			if !exists {
				for _, h := range hosts {
					if *host.ParentIP == h.IPAddress {
						break
					}
				}

				return domain.UseCaseError{
					Message:    domain.ErrConflict,
					StackTrace: fmt.Errorf("The Parent IP Address '%s' doesn't exist", *host.ParentIP),
				}
			}
		}
	}

	m.mutex.Lock()
	defer m.mutex.Unlock()

	err := m.repository.AddHosts(hosts)
	if err != nil {
		return &domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.AddHosts: %w", err),
		}
	}

	body, err := json.Marshal(
		domain.ConfigsEvent{
			EventType: "network_updated",
			Timestamp: time.Now().Format(time.RFC3339),
		})
	if err != nil {
		return &domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.AddHosts: %w", err),
		}
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
		return domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.DeleteHosts: %w", err),
		}
	}

	body, err := json.Marshal(
		domain.ConfigsEvent{
			EventType: "network_updated",
			Timestamp: time.Now().Format(time.RFC3339),
		})
	if err != nil {
		return domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.DeleteHosts: %w", err),
		}
	}

	m.eventProducer.PublishEvent(body)

	return nil
}

/* ------------------------------ PUT ------------------------------ */

func (m *Manager) UpdateHosts(hosts []domain.HostDTO) error {
	for _, host := range hosts {
		exists, err := m.repository.IpAddressExists(host.IPAddress)
		if err != nil {
			return domain.UseCaseError{
				Message:    domain.ErrInternal,
				StackTrace: fmt.Errorf("usecase.UpdateHosts: %w", err),
			}
		}
		if !exists {
			return domain.UseCaseError{
				Message:    domain.ErrConflict,
				StackTrace: fmt.Errorf("The IP Address '%s' doesn't exist", host.IPAddress),
			}
		}
	}

	m.mutex.Lock()
	defer m.mutex.Unlock()

	err := m.repository.UpdateHosts(hosts)
	if err != nil {
		return domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.UpdateHosts: %w", err),
		}
	}

	body, err := json.Marshal(
		domain.ConfigsEvent{
			EventType: "network_updated",
			Timestamp: time.Now().Format(time.RFC3339),
		})
	if err != nil {
		return domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.UpdateHosts: %w", err),
		}
	}

	m.eventProducer.PublishEvent(body)

	return nil
}

/* ------------------------------ PATCH ------------------------------ */

func (m *Manager) SwitchMaintenanceHost(data domain.SwitchMaintenanceRequest) error {
	hosts, err := m.repository.GetHosts()
	if err != nil {
		return domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.SwitchMaintenanceHost: %w", err),
		}
	}

	m.mutex.Lock()
	defer m.mutex.Unlock()

	var network = domain.NewNetwork(hosts)
	network.Mutex.Lock()
	network.Lookup[data.HostIP].SwitchMaintenanceStatus(*data.SetMaintenance)
	network.Mutex.Unlock()

	hosts = network.ParseToArray()

	err = m.repository.UpdateHosts(hosts)
	if err != nil {
		return domain.UseCaseError{
			Message:    domain.ErrInternal,
			StackTrace: fmt.Errorf("usecase.SwitchMaintenanceHost: %w", err),
		}
	}

	return nil
}
