package usecase

import (
	"encoding/json"
	"fmt"
	"server/internal/core/domain"
	"time"
)

func (m *Manager) GetConfigs() (domain.BusinessConfig, error) {
	configs, err := m.repository.GetConfigs()
	if err != nil {
		return domain.BusinessConfig{}, fmt.Errorf("usecase.GetConfigs: %w", err)
	}

	return configs, nil
}

func (m *Manager) UpdateConfigs(configs domain.BusinessConfig) error {
	err := m.repository.UpdateConfigs(configs)
	if err != nil {
		return fmt.Errorf("usecase.UpdateConfigs: %w", err)
	}

	body, err := json.Marshal(domain.ConfigsEvent{
		EventType: "configs_updated",
		Timestamp: time.Now().Format(time.RFC3339),
	})
	if err != nil {
		return fmt.Errorf("usecase.UpdateConfigs: %w", err)
	}

	m.eventProducer.PublishEvent(body)

	return nil
}
