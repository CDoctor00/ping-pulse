package domain

import (
	"database/sql"
	"time"
)

type HostDTO struct {
	ID        int
	Name      string
	IPAddress string
	Status    string
	AddedAt   time.Time
	LastPing  sql.NullTime
	LastPulse sql.NullTime
	ParentIP  sql.NullString
	Note      sql.NullString
	Stats     hostStats
}

type hostStats struct {
	PingsCount         int
	DisconnectionCount int //? Only when he actually go down and not when is unreachable
	AverageLatency     sql.NullFloat64
	AveragePacketLoss  sql.NullFloat64
}

func (s *hostStats) UpdateAvgLatency(newLatency float64) {
	s.AverageLatency = sql.NullFloat64{
		Valid:   true,
		Float64: (s.AverageLatency.Float64*float64(s.PingsCount-1) + newLatency) / float64(s.PingsCount),
	}
}

func (s *hostStats) UpdateAvgPacketLoss(newPacketLoss float64) {
	s.AveragePacketLoss = sql.NullFloat64{
		Valid:   true,
		Float64: (s.AveragePacketLoss.Float64*float64(s.PingsCount-1) + newPacketLoss) / float64(s.PingsCount),
	}
}
