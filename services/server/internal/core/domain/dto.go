package domain

import (
	"database/sql"
	"time"
)

type HostDTO struct {
	ID                 int
	Name               string
	IPAddress          string
	Status             string
	AddedAt            time.Time
	LastPing           sql.NullTime
	LastPulse          sql.NullTime
	ParentIP           sql.NullString
	Note               sql.NullString
	PingsCount         int
	DisconnectionCount int //? Only when he actually go down and not when is unreachable
	AverageLatency     sql.NullFloat64
	AveragePacketLoss  sql.NullFloat64
}

type AlarmDTO struct {
	ID          int
	HostIP      string
	Status      string
	StartedAt   time.Time
	ResolvedAt  sql.NullTime
	MessageInfo MessageInfo
}

type MessageInfo struct {
	Body  string     `json:"body"`
	Users []UserInfo `json:"users"`
}

type UserInfo struct {
	MessageID int     `json:"message_id"`
	ChatID    int64   `json:"chat_id"`
	SentTime  string  `json:"sent_time"`
	AckTime   *string `json:"acknowledged_time,omitempty"`
}
