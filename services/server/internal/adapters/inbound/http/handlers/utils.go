package handlers

import (
	"database/sql"
	"server/internal/core/domain"
	"time"
)

func parseHostDTO(dto domain.HostDTO) domain.Host {
	var host = domain.Host{
		ID:                 dto.ID,
		Name:               dto.Name,
		IPAddress:          dto.IPAddress,
		Status:             dto.Status,
		AddedAt:            dto.AddedAt.Format(time.RFC3339),
		PingsCount:         dto.PingsCount,
		DisconnectionCount: dto.DisconnectionCount,
	}
	if dto.ParentIP.Valid {
		host.ParentIP = &dto.ParentIP.String
	}
	if dto.Note.Valid {
		host.Note = &dto.Note.String
	}
	if dto.LastPing.Valid {
		timestamp := dto.LastPing.Time.Format(time.RFC3339)
		host.LastPing = &timestamp
	}
	if dto.LastPulse.Valid {
		timestamp := dto.LastPulse.Time.Format(time.RFC3339)
		host.LastPulse = &timestamp
	}
	if dto.AverageLatency.Valid {
		host.AverageLatency = &dto.AverageLatency.Float64
	}
	if dto.AveragePacketLoss.Valid {
		host.AveragePacketLoss = &dto.AveragePacketLoss.Float64
	}

	return host
}

func parseHostAPI(api domain.Host) domain.HostDTO {
	timestamp, _ := time.Parse(time.RFC3339, api.AddedAt)

	var dto = domain.HostDTO{
		ID:        api.ID,
		Name:      api.Name,
		IPAddress: api.IPAddress,
		Status:    api.Status,
		ParentIP: sql.NullString{
			Valid:  api.ParentIP != nil,
			String: *api.ParentIP,
		},
		AddedAt: timestamp,
		Note: sql.NullString{
			Valid:  api.Note != nil,
			String: *api.Note,
		},
		PingsCount:         api.PingsCount,
		DisconnectionCount: api.DisconnectionCount,
		AverageLatency: sql.NullFloat64{
			Valid:   api.AverageLatency != nil,
			Float64: *api.AverageLatency,
		},
		AveragePacketLoss: sql.NullFloat64{
			Valid:   api.AveragePacketLoss != nil,
			Float64: *api.AveragePacketLoss,
		},
	}

	if api.LastPing != nil {
		timestamp, _ = time.Parse(time.RFC3339, *api.LastPing)
		dto.LastPing = sql.NullTime{
			Valid: true,
			Time:  timestamp,
		}
	}
	if api.LastPulse != nil {
		timestamp, _ = time.Parse(time.RFC3339, *api.LastPulse)
		dto.LastPulse = sql.NullTime{
			Valid: true,
			Time:  timestamp,
		}
	}

	return dto
}

func parseAlarmDTO(dto domain.AlarmDTO) domain.Alarm {
	var alarm = domain.Alarm{
		ID:          dto.ID,
		HostIP:      dto.HostIP,
		Status:      dto.Status,
		StartedAt:   dto.StartedAt.Format(time.RFC3339),
		MessageInfo: dto.MessageInfo,
	}
	if dto.ResolvedAt.Valid {
		timestamp := dto.ResolvedAt.Time.Format(time.RFC3339)
		alarm.ResolvedAt = &timestamp
	}

	return alarm
}
