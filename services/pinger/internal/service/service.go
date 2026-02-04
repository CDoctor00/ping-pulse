package service

import (
	"log"
	"pinger/internal/core/domain"
	"pinger/internal/core/ports"
	"sync"
	"time"
)

type MonitoringService struct {
	network       *domain.Network
	config        domain.BusinessConfig
	mutex         sync.Mutex
	pinger        ports.NetworkPinger
	repository    ports.DataRepository
	alarmProducer ports.AlarmProducer
}

func NewMonitoringService(
	config domain.BusinessConfig,
	network *domain.Network,
	repository ports.DataRepository,
	pinger ports.NetworkPinger,
	alarmProducer ports.AlarmProducer,
) *MonitoringService {
	return &MonitoringService{
		network:       network,
		config:        config,
		repository:    repository,
		pinger:        pinger,
		alarmProducer: alarmProducer,
		mutex:         sync.Mutex{}, //? needed for update the business config and network
	}
}

func (s *MonitoringService) Run() {
	for {
		if err := s.routine(); err != nil {
			log.Printf("ERROR OCCURRED:\n%v", err)
		}

		s.mutex.Lock()
		delay := s.config.RoutineDelay
		s.mutex.Unlock()

		time.Sleep(time.Duration(delay.Value) * time.Second) //? To be sure of the delay time from each routine
	}
}
