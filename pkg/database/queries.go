package database

import (
	"fmt"
	"ping-pulse/pkg/types"
)

func (model Model) GetConfigs() (map[string]string, error) {
	var configs = make(map[string]string)

	var query = `SELECT key, value FROM configs;`

	results, errQuery := model.DB.Query(query)
	if errQuery != nil {
		return configs, fmt.Errorf("queries.GetConfigs: %w", errQuery)
	}

	var keyConfig, valueConfig string
	for results.Next() {
		errScan := results.Scan(&keyConfig, &valueConfig)
		if errScan != nil {
			return configs, fmt.Errorf("queries.GetConfigs: %w", errScan)
		}
		configs[keyConfig] = valueConfig
	}

	return configs, nil
}

func (model Model) GetHosts() ([]types.Host, error) {
	var hosts = []types.Host{}

	var query = `SELECT 
	name, ip_address, status, added_at, last_ping,
	last_pulse, disconnection_count, description,
	parent_ip, pings_count, average_latency, notified
	FROM hosts
	ORDER BY parent_ip ASC;`

	results, errQuery := model.Tx.Query(query)
	if errQuery != nil {
		return hosts, fmt.Errorf("queries.GetHosts: %w", errQuery)
	}

	var host types.Host
	for results.Next() {
		errScan := results.Scan(
			&host.Name,
			&host.IPAddress,
			&host.Status,
			&host.AddedAt,
			&host.LastPing,
			&host.LastPulse,
			&host.DisconnectionCount,
			&host.Description,
			&host.ParentIP,
			&host.PingsCount,
			&host.AverageLatency,
			&host.Notified,
		)
		if errScan != nil {
			return hosts, fmt.Errorf("queries.GetHosts: %w", errScan)
		}
		hosts = append(hosts, host)
	}

	return hosts, nil
}

func (model Model) InsertData(hosts []types.Host) error {
	if len(hosts) == 0 {
		return fmt.Errorf("queries.InsertData: no rows to save")
	}

	var query = fmt.Sprintf(`INSERT OR REPLACE INTO hosts (
	added_at, average_latency, average_packet_loss,
	description, disconnection_count, ip_address, last_ping,
	last_pulse, name, notified, parent_ip, pings_count, status) VALUES %s;`,
		createQueryPlaceholders(13, len(hosts)))

	var args = createArguments(hosts)

	_, errExec := model.Tx.Exec(query, args...)
	if errExec != nil {
		return fmt.Errorf("queries.InsertData: %w", errExec)
	}

	return nil
}
