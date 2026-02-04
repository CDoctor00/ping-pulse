package usecase

import (
	"server/internal/core/ports/outbound"
	"sync"
)

type Manager struct {
	mutex         sync.Mutex
	repository    outbound.DataRepository
	eventProducer outbound.UpdateConfigProducer
}

func NewManager(
	dataRepository outbound.DataRepository,
	eventProducer outbound.UpdateConfigProducer) *Manager {
	return &Manager{
		mutex:         sync.Mutex{},
		repository:    dataRepository,
		eventProducer: eventProducer,
	}
}
