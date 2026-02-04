package repository

import (
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

func (pa *PostgresAdapter) UpdateHosts(hosts []domain.HostDTO) error { //TODO change
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
	WHERE h.id = nw.id::integer;`, createPlaceholders(len(hosts), 8))

	var tx = pa.db.MustBegin()

	result, err := tx.Exec(query, parseDataToUpdate(hosts)...)
	if err != nil {
		return fmt.Errorf("repository.UpdateHosts: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("repository.UpdateHosts: %w", err)
	}

	//TODO check
	affected, _ := result.RowsAffected()
	fmt.Printf("\nUpdate Hosts: %d - %d", len(hosts), affected)

	return nil
}
