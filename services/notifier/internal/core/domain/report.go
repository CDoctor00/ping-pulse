package domain

type CycleReport struct {
	EventType  string     `json:"event_type"`
	Timestamp  string     `json:"timestamp"` //datetime=2006-01-02T15:04:05Z07:00
	Summary    Summary    `json:"summary"`
	Incidents  []HostData `json:"incidents"`
	Recoveries []HostData `json:"recoveries"`
}

type Summary struct {
	TotalHosts        int `json:"total_hosts"`
	HostsDisconnected int `json:"hosts_disconnected"`
	HostsUnreachable  int `json:"hosts_unreachable"`
	HostsReconnected  int `json:"hosts_reconnected"`
	HostsRestored     int `json:"hosts_restored"`
}

type HostData struct {
	HostIP         string         `json:"host_ip"`
	HostName       string         `json:"host_name"`
	Status         string         `json:"status"`
	PreviousStatus string         `json:"previous_status"`      //TODO Check if to remove
	LastPulse      *string        `json:"last_pulse,omitempty"` //? datetime=2006-01-02T15:04:05Z07:00
	Impact         ImpactAnalysis `json:"impact_analysis"`
}

type ImpactAnalysis struct {
	ChildrenCount int      `json:"children_count"`
	ChildrenHosts []string `json:"children_hosts"` //? Format: "IP (Name)"
}
