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
	ChildrenID  []int64
	StartedAt   time.Time
	ResolvedAt  sql.NullTime
	MessageInfo MessageInfo
}

type MessageInfo struct {
	Body  string     `json:"body" validate:"required"`
	Users []UserInfo `json:"users" validate:"required,min=1,dive"`
}

type UserInfo struct {
	MessageID int     `json:"messageID" validate:"required,gt=0"`
	ChatID    int64   `json:"chatID" validate:"required,gt=0"`
	SentTime  string  `json:"sentTime" validate:"required,datetime=2006-01-02T15:04:05Z07:00"`
	AckTime   *string `json:"acknowledgedTime" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
}
