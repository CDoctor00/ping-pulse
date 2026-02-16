package domain

import "time"

type CycleReport struct {
	EventType  string     `json:"eventType"`
	Timestamp  string     `json:"timestamp"` //? datetime=2006-01-02T15:04:05Z07:00
	Summary    Summary    `json:"summary"`
	Incidents  []Incident `json:"incidents"`
	Recoveries []Recovery `json:"recoveries"`
}

type Summary struct {
	TotalHosts        int `json:"totalHosts"`
	HostsDisconnected int `json:"hostsDisconnected"`
	HostsUnreachable  int `json:"hostsUnreachable"`
	HostsReconnected  int `json:"hostsReconnected"`
	HostsRestored     int `json:"hostsRestored"`
}

type Incident struct {
	HostIP         string         `json:"hostIP"`
	HostName       string         `json:"hostName"`
	Status         string         `json:"status"`
	PreviousStatus string         `json:"previousStatus"`      //TODO Check if to remove
	LastPulse      *string        `json:"lastPulse,omitempty"` //? datetime=2006-01-02T15:04:05Z07:00
	Impact         ImpactAnalysis `json:"impactAnalysis"`
}

type ImpactAnalysis struct {
	ChildrenCount int      `json:"childrenCount"`
	ChildrenHosts []string `json:"childrenHosts"` //? Format: "IP (Name)"
}

type Recovery struct {
	HostIP         string         `json:"hostIP"`
	HostName       string         `json:"hostName"`
	Status         string         `json:"status"`
	PreviousStatus string         `json:"previousStatus"`
	Impact         ImpactAnalysis `json:"impactAnalysis"`
}

func NewCycleReport() *CycleReport {
	return &CycleReport{
		EventType:  "networkStatusReport",
		Timestamp:  time.Now().Format(time.RFC3339),
		Incidents:  make([]Incident, 0),
		Recoveries: make([]Recovery, 0),
	}
}

func (r *CycleReport) IsEmpty() bool {
	return len(r.Incidents) == 0 && len(r.Recoveries) == 0
}
