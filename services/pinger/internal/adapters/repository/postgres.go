package repository

import (
	"encoding/json"
	"fmt"
	"pinger/internal/core/domain"
	"pinger/internal/core/ports"

	"github.com/jmoiron/sqlx"
)

type PostgresAdapter struct {
	db *sqlx.DB
}

var _ ports.DataRepository = (*PostgresAdapter)(nil)

func NewPostgresAdapter(clientDB *sqlx.DB) *PostgresAdapter {
	return &PostgresAdapter{db: clientDB}
}

func (pa *PostgresAdapter) GetBusinessConfig() (domain.BusinessConfig, error) {
	query := "SELECT data FROM ping_pulse.configs WHERE id = 1"
	result := pa.db.QueryRow(query)

	var rawData []byte
	if err := result.Scan(&rawData); err != nil {
		return domain.BusinessConfig{}, fmt.Errorf("repository.GetBusinessConfig: %w", err)
	}

	var configs domain.BusinessConfig

	if err := json.Unmarshal(rawData, &configs); err != nil {
		return domain.BusinessConfig{}, fmt.Errorf("repository.GetBusinessConfig: %w", err)
	}

	return configs, nil
}

func (pa *PostgresAdapter) GetHosts() ([]domain.HostDTO, error) {
	var hosts = make([]domain.HostDTO, 0)

	query := `SELECT 
	id, ip_address, name, status, parent_ip, last_ping, last_pulse,	pings_count,
	 disconnection_count, avg_latency, avg_packet_loss, note, added_at
	FROM ping_pulse.hosts;`
	results, err := pa.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("repository.GetBusinessConfig: %w", err)
	}

	var host domain.HostDTO
	for results.Next() {
		err = results.Scan(
			&host.ID,
			&host.IPAddress,
			&host.Name,
			&host.Status,
			&host.ParentIP,
			&host.LastPing,
			&host.LastPulse,
			&host.Stats.PingsCount,
			&host.Stats.DisconnectionCount,
			&host.Stats.AverageLatency,
			&host.Stats.AveragePacketLoss,
			&host.Note,
			&host.AddedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("repository.GetHosts: %w", err)
		}

		hosts = append(hosts, host)
	}

	return hosts, nil
}

func (pa *PostgresAdapter) UpdateHosts(hosts []domain.HostDTO) error {
	query := fmt.Sprintf(`WITH new_hosts (id, status, last_ping, last_pulse, pings_count,
	 disconnection_count, avg_latency, avg_packet_loss) AS (
	 	VALUES %s
	 )
		UPDATE ping_pulse.hosts h
		SET 
			status = nh.status::host_status,
			last_ping = nh.last_ping::timestamptz,
			last_pulse = nh.last_pulse::timestamptz,
			pings_count = nh.pings_count::integer,
			disconnection_count = nh.disconnection_count::integer,
			avg_latency = nh.avg_latency::numeric(10,5),
			avg_packet_loss = nh.avg_packet_loss::numeric(5,2)
	FROM new_hosts nh
	WHERE h.id = nh.id::integer;`, createPlaceholders(len(hosts), 8))

	var tx = pa.db.MustBegin()

	result, err := tx.Exec(query, parseData(hosts)...)
	if err != nil {
		return fmt.Errorf("repository.UpdateHosts: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("repository.UpdateHosts: %w", err)
	}

	affected, _ := result.RowsAffected()
	if affected != int64(len(hosts)) {
		return fmt.Errorf("repository.UpdateConfigs: some row it has not been updated")
	}

	return nil
}
