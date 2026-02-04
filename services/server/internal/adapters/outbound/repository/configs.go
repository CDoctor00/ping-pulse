package repository

import (
	"encoding/json"
	"fmt"
	"server/internal/core/domain"
)

/* ------------------------------ SELECT ------------------------------ */

func (pa *PostgresAdapter) GetConfigs() (domain.BusinessConfig, error) {
	query := "SELECT data FROM ping_pulse.configs WHERE id = 1;"
	result := pa.db.QueryRow(query)

	var rawData []byte
	if err := result.Scan(&rawData); err != nil {
		return domain.BusinessConfig{}, fmt.Errorf("repository.GetConfigs: %w", err)
	}

	var configs domain.BusinessConfig

	if err := json.Unmarshal(rawData, &configs); err != nil {
		return domain.BusinessConfig{}, fmt.Errorf("repository.GetConfigs: %w", err)
	}

	return configs, nil
}

/* ------------------------------ UPDATE ------------------------------ */

func (pa *PostgresAdapter) UpdateConfigs(configs domain.BusinessConfig) error {
	data, err := json.Marshal(configs)
	if err != nil {
		return fmt.Errorf("repository.UpdateConfigs: %w", err)
	}

	query := "UPDATE ping_pulse.configs SET data = $1, updated_at = NOW() WHERE id = 1;"
	result, err := pa.db.Exec(query, data)
	if err != nil {
		return fmt.Errorf("repository.UpdateConfigs: %w", err)
	}

	affected, _ := result.RowsAffected()
	if affected == 0 {
		return fmt.Errorf("repository.UpdateConfigs: no row updated")
	}

	return nil
}
