package types

import "database/sql"

type Host struct {
	Name               string
	IPAddress          string
	Status             string
	AddedAt            string         //datetime with ISO8601 format
	LastPing           sql.NullString //datetime with ISO8601 format
	LastPulse          sql.NullString //datetime with ISO8601 format
	ParentIP           sql.NullString
	Description        sql.NullString
	Notified           bool
	DisconnectionCount int
	PingsCount         int
	AverageLatency     int
	AveragePacketLoss  int
}
