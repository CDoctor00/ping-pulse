package service

import (
	"encoding/json"
	"fmt"
	"pinger/internal/core/domain"
	"time"
)

func (s *MonitoringService) routine() error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	fmt.Printf("\n----- NEW ROUTINE STARTED (%s) -----\n",
		time.Now().Format(time.DateTime))
	var report = domain.NewCycleReport()
	var ctx = newCycleContext(report)

	if err := s.checkNetwork(ctx); err != nil {
		return fmt.Errorf("service.routine: %w", err)
	}

	hosts := s.network.ParseToArray()
	if err := s.repository.UpdateHosts(hosts); err != nil {
		return fmt.Errorf("service.routine: %w", err)
	}

	if !report.IsEmpty() {
		report.Summary.HostsReconnected = len(report.Recoveries)
		report.Summary.HostsDisconnected = len(report.Incidents)

		for _, i := range report.Incidents {
			report.Summary.HostsUnreachable += i.Impact.ChildrenCount
		}
		for i, r := range report.Recoveries {
			generateRecoveryChildren(s.network.Lookup[r.HostIP], &r)
			report.Summary.HostsRestored += r.Impact.ChildrenCount
			report.Recoveries[i] = r
		}
		report.Summary.TotalHosts = report.Summary.HostsReconnected +
			report.Summary.HostsRestored + report.Summary.HostsDisconnected +
			report.Summary.HostsUnreachable

		body, err := json.Marshal(report)
		if err != nil {
			return fmt.Errorf("service.routine: %w", err)
		}

		err = s.alarmProducer.PublishEvent(body)
		if err != nil {
			return fmt.Errorf("service.routine: %w", err)
		}
	}

	fmt.Printf("\n----- ROUTINE ENDED (%s) -----\n",
		time.Now().Format(time.DateTime))

	return nil
}

func (s *MonitoringService) checkNetwork(ctx *cycleContext) error {
	s.network.Mutex.Lock()
	defer s.network.Mutex.Unlock()

	for _, root := range s.network.Roots {
		if err := s.checkNode(root, ctx); err != nil {
			return fmt.Errorf("service.CheckNetwork: %w", err)
		}
	}

	return nil
}

func (s *MonitoringService) checkNode(node *domain.Host, cycleCtx *cycleContext) error {
	node.Mutex.Lock()
	defer node.Mutex.Unlock()

	if node.Data.Status == domain.StatusMantainance {
		return nil
	}

	var oldStatus = node.Data.Status

	result, err := s.pinger.ExecPing(node.Data.IPAddress)
	if err != nil {
		return fmt.Errorf("service.CheckNode (id: %d): %v", node.Data.ID, err)
	}

	updateHost(node, result, s.config.PendingThreshold.Value)

	if node.Data.Status != oldStatus {
		cycleCtx.handleStatusChange(node, oldStatus)
	}

	fmt.Printf("\nName: %s, IP Address: %s, Status: %s, Average Latency: %f, PacketLoss: %f",
		node.Data.Name, node.Data.IPAddress, node.Data.Status,
		node.Data.Stats.AverageLatency.Float64, node.Data.Stats.AveragePacketLoss.Float64,
	)

	for _, child := range node.Children {
		if result.IsReachable {
			if err := s.checkNode(child, cycleCtx); err != nil {
				return fmt.Errorf("service.CheckNode: %w", err)
			}
		} else if node.Data.Status != domain.StatusDown {
			cycleCtx.markChildrenPending(child)
		}
	}

	return nil
}
