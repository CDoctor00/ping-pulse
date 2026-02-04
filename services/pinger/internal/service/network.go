package service

import (
	"database/sql"
	"pinger/internal/core/domain"
)

func updateHost(host *domain.Host, result domain.PingResult, pendingTreshold int) {
	host.Data.Stats.PingsCount++
	host.Data.LastPing = sql.NullTime{
		Valid: true,
		Time:  result.Timestamp,
	}

	if result.IsReachable {
		host.Data.LastPulse = sql.NullTime{
			Valid: true,
			Time:  result.Timestamp,
		}
		host.Data.Status = domain.StatusUp
		host.Data.Stats.UpdateAvgPacketLoss(result.AveragePacketLoss)
		host.Data.Stats.UpdateAvgLatency(result.AverageLatency)
	} else if host.Data.Status != domain.StatusDown {
		wasUp := host.Data.Status == domain.StatusUp

		host.Data.Status = domain.StatusDown
		if host.Data.LastPulse.Valid && int(result.Timestamp.Sub(host.Data.LastPulse.Time).Seconds()) <= pendingTreshold {
			host.Data.Status = domain.StatusPending
		}

		if wasUp {
			host.Data.Stats.DisconnectionCount++
			host.Data.Stats.UpdateAvgPacketLoss(result.AveragePacketLoss)
			host.Data.Stats.UpdateAvgLatency(result.AverageLatency)
		}
	}
	//? Update PacketLoss and Latency only on the first time of disconnection or when host is up
}
