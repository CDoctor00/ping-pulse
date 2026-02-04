package service

import (
	"fmt"
	"log"
	"pinger/internal/core/domain"
	"pinger/internal/core/ports"
)

var _ ports.ConfigReloader = (*MonitoringService)(nil)

func (s *MonitoringService) ReloadConfiguration() error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	busConf, err := s.repository.GetBusinessConfig()
	if err != nil {
		return fmt.Errorf("service.ReloadConfiguration: %v", err)
	}

	hosts, err := s.repository.GetHosts()
	if err != nil {
		return fmt.Errorf("service.ReloadConfiguration: %v", err)
	}

	s.config = busConf
	s.pinger.UpdateConfigs(busConf)
	s.network = domain.NewNetwork(hosts)

	log.Printf("CONFIGURATION UPDATED\n%+v", busConf)

	return nil
}
