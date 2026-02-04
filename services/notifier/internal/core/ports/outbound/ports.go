package outbound

import (
	"notifier/internal/core/domain"
	"time"
)

type DataRepository interface {
	GetAlarmByID(alarmID int) (domain.AlarmDTO, error)
	GetActiveAlarmByHost(hostIP string) (domain.AlarmDTO, error)
	GetAllPendingAlarms() ([]domain.AlarmDTO, error)
	AddAlarm(hostIP string, timestamp time.Time) (domain.AlarmDTO, error)
	SetAlarmMessageInfo(alarmID int, messageInfo domain.MessageInfo) error
	SetAlarmAcknowledged(alarmID int) error
	SetAlarmResolved(alarmID int) error
}

type Notifier interface {
	SendMessage(message domain.MessageData) (domain.UserInfo, error)
	DeleteMessage(chatID int64, messageID int) error
	RemoveKeyboard(chatID int64, messageID int) error
	SendCallbackAnswer(callbackID string, message string) error
}
