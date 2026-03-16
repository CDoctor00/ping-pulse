package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"server/internal/core/domain"
)

/* ------------------------------ SELECT ------------------------------ */

func (pa *PostgresAdapter) GetHost(hostID int) (domain.HostDTO, error) {
	query := `SELECT 
	id, ip_address, name, status, parent_ip, last_ping, last_pulse,	pings_count,
	disconnection_count, avg_latency, avg_packet_loss, note, added_at
	FROM ping_pulse.hosts
	WHERE id = $1;`
	result := pa.db.QueryRow(query, hostID)

	var host domain.HostDTO
	err := result.Scan(
		&host.ID,
		&host.IPAddress,
		&host.Name,
		&host.Status,
		&host.ParentIP,
		&host.LastPing,
		&host.LastPulse,
		&host.PingsCount,
		&host.DisconnectionCount,
		&host.AverageLatency,
		&host.AveragePacketLoss,
		&host.Note,
		&host.AddedAt,
	)
	if err != nil {
		return domain.HostDTO{}, fmt.Errorf("repository.GetHost: %w", err)
	}

	return host, nil
}

func (pa *PostgresAdapter) GetHosts() ([]domain.HostDTO, error) {
	var hosts = make([]domain.HostDTO, 0)

	query := `SELECT 
	id, ip_address, name, status, parent_ip, last_ping, last_pulse,	pings_count,
	disconnection_count, avg_latency, avg_packet_loss, note, added_at
	FROM ping_pulse.hosts;`
	results, err := pa.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("repository.GetHosts: %w", err)
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
			&host.PingsCount,
			&host.DisconnectionCount,
			&host.AverageLatency,
			&host.AveragePacketLoss,
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

func (pa *PostgresAdapter) IsNameAlreadyUsed(name string) (bool, error) {
	query := `SELECT 1 FROM ping_pulse.hosts WHERE name = $1;`

	var value string
	err := pa.db.QueryRow(query, name).Scan(&value)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, fmt.Errorf("repository.IsNameAlreadyUsed: %w", err)
	}

	return true, nil
}

func (pa *PostgresAdapter) IpAddressExists(ipAddress string) (bool, error) {
	query := `SELECT 1 FROM ping_pulse.hosts WHERE ip_address = $1;`

	var value string
	err := pa.db.QueryRow(query, ipAddress).Scan(&value)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, fmt.Errorf("repository.IpAddressExists: %w", err)
	}

	return true, nil
}

/* ------------------------------ INSERT ------------------------------ */

func (pa *PostgresAdapter) AddHosts(hosts []domain.NewHost) error {
	query := fmt.Sprintf(`INSERT INTO ping_pulse.hosts (ip_address, name, note, parent_ip)
	VALUES %s;`, createPlaceholders(len(hosts), 4))

	var tx = pa.db.MustBegin()
	args := parseDataToInsert(hosts)
	_, err := tx.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("repository.AddHosts: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("repository.AddHosts: %w", err)
	}

	return nil
}

/* ------------------------------ DELETE ------------------------------ */

func (pa *PostgresAdapter) DeleteHosts(hostsID []int) error {
	query := fmt.Sprintf(`DELETE FROM ping_pulse.hosts
	WHERE id IN %s;`, createPlaceholders(1, len(hostsID)))

	args := make([]any, len(hostsID))
	for i, id := range hostsID {
		args[i] = id
	}

	var tx = pa.db.MustBegin()

	_, err := tx.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("repository.DeleteHosts: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("repository.DeleteHosts: %w", err)
	}

	return nil
}

/* ------------------------------ UPDATE ------------------------------ */

func (pa *PostgresAdapter) UpdateHosts(hosts []domain.HostDTO) error {
	query := fmt.Sprintf(`WITH new_hosts (id, name, ip_address, parent_ip, note) AS (
	 	VALUES %s
	 )
		UPDATE ping_pulse.hosts h
		SET 
			name = nh.name::VARCHAR(255),
			ip_address = nh.ip_address::VARCHAR(20),
			parent_ip = nh.parent_ip::VARCHAR(20),
			note = nh.note::VARCHAR(500)
	FROM new_hosts nh
	WHERE h.id = nh.id::integer;`, createPlaceholders(len(hosts), 5))

	var tx = pa.db.MustBegin()

	_, err := tx.Exec(query, parseDataToUpdate(hosts)...)
	if err != nil {
		return fmt.Errorf("repository.UpdateHosts: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("repository.UpdateHosts: %w", err)
	}

	return nil
}
