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

	log.Printf("CONFIGURATION UPDATED\n")
	fmt.Printf(" - Packet Size: %v\n", busConf.PacketSize.Value)
	fmt.Printf(" - Packets Count: %v\n", busConf.PacketsCount.Value)
	fmt.Printf(" - Pings Timeout: %v\n", busConf.PingsTimeout.Value)
	fmt.Printf(" - Pings Interval: %v\n", busConf.PingsInterval.Value)
	fmt.Printf(" - Routine Delay: %v\n", busConf.RoutineDelay.Value)
	fmt.Printf(" - Pending Threshold: %v\n", busConf.PendingThreshold.Value)

	return nil
}
