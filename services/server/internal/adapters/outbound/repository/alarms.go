package repository

import (
	"encoding/json"
	"fmt"
	"server/internal/core/domain"
)

/* ------------------------------ SELECT ------------------------------ */

func (pa *PostgresAdapter) GetAlarmByID(alarmID int) (domain.AlarmDTO, error) {
	query := `SELECT 
	id, host_ip, status, started_at, resolved_at, message_info 
	FROM ping_pulse.alarms WHERE id = $1;`
	result := pa.db.QueryRow(query, alarmID)

	var alarm domain.AlarmDTO
	var rawData []byte
	err := result.Scan(
		&alarm.ID,
		&alarm.HostIP,
		&alarm.Status,
		&alarm.StartedAt,
		&alarm.ResolvedAt,
		&rawData,
	)
	if err != nil {
		return domain.AlarmDTO{}, fmt.Errorf("repository.GetAlarmByID: %w", err)
	}

	if err = json.Unmarshal(rawData, &alarm.MessageInfo); err != nil {
		return domain.AlarmDTO{}, fmt.Errorf("repository.GetAlarmByID: %w", err)
	}

	return alarm, nil
}

func (pa *PostgresAdapter) GetAlarms() ([]domain.AlarmDTO, error) {
	query := `SELECT 
	id, host_ip, status, started_at, resolved_at, message_info 
	FROM ping_pulse.alarms;`
	result, err := pa.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("repository.GetAlarms: %w", err)
	}

	var (
		alarms  = make([]domain.AlarmDTO, 0)
		alarm   domain.AlarmDTO
		rawData []byte
	)
	for result.Next() {
		err = result.Scan(
			&alarm.ID,
			&alarm.HostIP,
			&alarm.Status,
			&alarm.StartedAt,
			&alarm.ResolvedAt,
			&rawData,
		)
		if err != nil {
			return nil, fmt.Errorf("repository.GetAlarms: %w", err)
		}

		if err = json.Unmarshal(rawData, &alarm.MessageInfo); err != nil {
			return nil, fmt.Errorf("repository.GetAlarms: %w", err)
		}

		alarms = append(alarms, alarm)
	}

	return alarms, nil
}

/* ------------------------------ DELETE ------------------------------ */

func (pa *PostgresAdapter) DeleteAlarms(alarmsID []int) error {
	query := fmt.Sprintf(`DELETE FROM ping_pulse.alarms
	WHERE id IN %s;`, createPlaceholders(1, len(alarmsID)))

	args := make([]any, len(alarmsID))
	for i, id := range alarmsID {
		args[i] = id
	}

	var tx = pa.db.MustBegin()

	_, err := tx.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("repository.DeleteAlarms: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("repository.DeleteAlarms: %w", err)
	}

	return nil
}
