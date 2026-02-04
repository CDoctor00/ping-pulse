package domain

import "time"

type CycleReport struct {
	EventType  string     `json:"event_type"`
	Timestamp  string     `json:"timestamp"` //? datetime=2006-01-02T15:04:05Z07:00
	Summary    Summary    `json:"summary"`
	Incidents  []Incident `json:"incidents"`
	Recoveries []Recovery `json:"recoveries"`
}

type Summary struct {
	TotalHosts        int `json:"total_hosts"`
	HostsDisconnected int `json:"hosts_disconnected"`
	HostsUnreachable  int `json:"hosts_unreachable"`
	HostsReconnected  int `json:"hosts_reconnected"`
	HostsRestored     int `json:"hosts_restored"`
}

type Incident struct {
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

type Recovery struct {
	HostIP         string         `json:"host_ip"`
	HostName       string         `json:"host_name"`
	Status         string         `json:"status"`
	PreviousStatus string         `json:"previous_status"`
	Impact         ImpactAnalysis `json:"impact_analysis"`
}

func NewCycleReport() *CycleReport {
	return &CycleReport{
		EventType:  "network_status_report",
		Timestamp:  time.Now().Format(time.RFC3339),
		Incidents:  make([]Incident, 0),
		Recoveries: make([]Recovery, 0),
	}
}

func (r *CycleReport) IsEmpty() bool {
	return len(r.Incidents) == 0 && len(r.Recoveries) == 0
}
