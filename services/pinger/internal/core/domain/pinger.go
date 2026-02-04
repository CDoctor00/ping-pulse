package domain

import (
	"time"
)

type PingResult struct {
	IPAddress         string
	PacketsSent       int
	PacketsReceived   int
	IsReachable       bool
	AverageLatency    float64
	AveragePacketLoss float64
	Timestamp         time.Time
}
