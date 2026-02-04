package domain

import (
	"database/sql"
	"time"
)

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
