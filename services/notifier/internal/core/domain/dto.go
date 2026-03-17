package domain

import (
	"database/sql"
	"time"
)

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
	Body  string     `json:"body"`
	Users []UserInfo `json:"users"`
}

type UserInfo struct {
	MessageID int     `json:"messageID"`
	ChatID    int64   `json:"chatID"`
	SentTime  string  `json:"sentTime"`
	AckTime   *string `json:"acknowledgedTime,omitempty"`
}
