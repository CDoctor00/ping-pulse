package repository

import (
	"encoding/json"
	"fmt"
	"notifier/internal/core/domain"
	"notifier/internal/core/ports/outbound"
	"time"

	"github.com/jmoiron/sqlx"
)

type PostgresAdapter struct {
	db *sqlx.DB
}

var _ outbound.DataRepository = (*PostgresAdapter)(nil)

func NewPostgresAdapter(clientDB *sqlx.DB) *PostgresAdapter {
	return &PostgresAdapter{db: clientDB}
}

/* ------------------------------ SELECT ------------------------------ */

func (pa *PostgresAdapter) GetBusinessConfigs() (domain.BusinessConfig, error) {
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

func (pa *PostgresAdapter) GetActiveAlarmByHost(hostIP string) (domain.AlarmDTO, error) {
	query := `SELECT 
	id, host_ip, status, started_at, resolved_at, message_info 
	FROM ping_pulse.alarms WHERE status != 'RESOLVED' AND host_ip = $1;`
	result := pa.db.QueryRow(query, hostIP)

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
		return domain.AlarmDTO{}, fmt.Errorf("repository.GetActiveAlarmByHost: %w", err)
	}

	if err = json.Unmarshal(rawData, &alarm.MessageInfo); err != nil {
		return domain.AlarmDTO{}, fmt.Errorf("repository.GetActiveAlarmByHost: %w", err)
	}

	return alarm, nil
}

func (pa *PostgresAdapter) GetAllPendingAlarms() ([]domain.AlarmDTO, error) {
	query := `SELECT 
	id, host_ip, status, started_at, resolved_at, message_info 
	FROM ping_pulse.alarms WHERE status = 'PENDING';`
	result, err := pa.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("repository.GetAllPendingAlarms: %w", err)
	}

	var alarms = make([]domain.AlarmDTO, 0)
	for result.Next() {
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
			return nil, fmt.Errorf("repository.GetAllPendingAlarms: %w", err)
		}

		if err = json.Unmarshal(rawData, &alarm.MessageInfo); err != nil {
			return nil, fmt.Errorf("repository.GetAllPendingAlarms: %w", err)
		}

		alarms = append(alarms, alarm)
	}

	return alarms, nil
}

/* ------------------------------ INSERT ------------------------------ */

func (pa *PostgresAdapter) AddAlarm(hostIP string, startedAt time.Time) (domain.AlarmDTO, error) {
	query := "INSERT INTO ping_pulse.alarms (host_ip, started_at) VALUES ($1, $2) RETURNING id, status;"

	var tx = pa.db.MustBegin()

	result := tx.QueryRowx(query, hostIP, startedAt)

	var alarm = domain.AlarmDTO{
		HostIP:    hostIP,
		StartedAt: startedAt,
	}
	if err := result.Scan(&alarm.ID, &alarm.Status); err != nil {
		return domain.AlarmDTO{}, fmt.Errorf("repository.AddAlarm: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return domain.AlarmDTO{}, fmt.Errorf("repository.AddAlarm: %w", err)
	}

	return alarm, nil
}

/* ------------------------------ UPDATE ------------------------------ */

func (pa *PostgresAdapter) SetAlarmMessageInfo(
	alarmID int, messageInfo domain.MessageInfo) error {
	data, err := json.Marshal(messageInfo)
	if err != nil {
		return fmt.Errorf("repository.SetAlarmMessageInfo: %w", err)
	}

	var tx = pa.db.MustBegin()

	query := "UPDATE ping_pulse.alarms SET message_info = $1 WHERE id = $2;"
	_, err = tx.Exec(query, data, alarmID)
	if err != nil {
		return fmt.Errorf("repository.SetAlarmMessageInfo: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("repository.SetAlarmMessageInfo: %w", err)
	}

	return nil
}

func (pa *PostgresAdapter) SetAlarmAcknowledged(alarmID int) error {
	query := `UPDATE ping_pulse.alarms 
		SET status = CASE
			WHEN status = 'PENDING' THEN 'ACKNOWLEDGED'::alarm_status
			ELSE status
		END
		WHERE id = $1;`

	var tx = pa.db.MustBegin()

	_, err := tx.Exec(query, alarmID)
	if err != nil {
		return fmt.Errorf("repository.SetAlarmAcknowledged: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("repository.SetAlarmAcknowledged: %w", err)
	}

	return nil
}

func (pa *PostgresAdapter) SetAlarmResolved(alarmID int) error {
	query := `UPDATE ping_pulse.alarms 
		SET status = 'RESOLVED'::alarm_status,
		resolved_at = NOW() 
		WHERE id = $1;`

	var tx = pa.db.MustBegin()

	_, err := tx.Exec(query, alarmID)
	if err != nil {
		return fmt.Errorf("repository.SetAlarmResolved: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("repository.SetAlarmResolved: %w", err)
	}

	return nil
}
