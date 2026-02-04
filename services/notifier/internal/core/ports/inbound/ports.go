package inbound

import "notifier/internal/core/domain"

type EventManager interface {
	HandleReportEvent(domain.CycleReport) error
	HandleNotifierEvent(eventData string, chatID int64, messageID int, callbackID string) error
}
