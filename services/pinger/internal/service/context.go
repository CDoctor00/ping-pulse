package service

import (
	"fmt"
	"pinger/internal/core/domain"
	"sync"
	"time"
)

type cycleContext struct {
	report *domain.CycleReport
	mu     sync.Mutex
}

func newCycleContext(report *domain.CycleReport) *cycleContext {
	return &cycleContext{
		report: report,
		mu:     sync.Mutex{},
	}
}

func (ctx *cycleContext) handleStatusChange(node *domain.Host, oldStatus string) {
	ctx.mu.Lock()
	defer ctx.mu.Unlock()

	if node.IsReconnected(oldStatus) {
		var recovery = domain.Recovery{
			HostIP:         node.Data.IPAddress,
			HostName:       node.Data.Name,
			Status:         domain.StatusUp,
			PreviousStatus: oldStatus,
			Impact: domain.ImpactAnalysis{
				ChildrenCount: 0,
				ChildrenHosts: make([]string, 0),
			},
		}

		ctx.report.Recoveries = append(ctx.report.Recoveries, recovery)
		return
	}

	if node.IsDisconnected(oldStatus) {
		var incident = domain.Incident{
			HostIP:         node.Data.IPAddress,
			HostName:       node.Data.Name,
			Status:         domain.StatusDown,
			PreviousStatus: oldStatus,
			LastPulse:      nil,
			Impact: domain.ImpactAnalysis{
				ChildrenCount: 0,
				ChildrenHosts: make([]string, 0),
			},
		}
		if node.Data.LastPulse.Valid {
			lastPulseTime := node.Data.LastPulse.Time.Format(time.RFC3339)
			incident.LastPulse = &lastPulseTime
		}

		ctx.markChildrenUnreachable(node, &incident)

		ctx.report.Incidents = append(ctx.report.Incidents, incident)
	}
}

func (ctx *cycleContext) markChildrenUnreachable(node *domain.Host, rootIncident *domain.Incident) {
	for _, child := range node.Children {
		child.Mutex.Lock()

		child.Data.Status = domain.StatusUnreachable

		rootIncident.Impact.ChildrenCount++
		rootIncident.Impact.ChildrenHosts = append(
			rootIncident.Impact.ChildrenHosts, fmt.Sprintf("%s (%s)",
				child.Data.Name, child.Data.IPAddress))

		child.Mutex.Unlock()

		fmt.Printf("\nName:%s, IP Address: %s, Status: %s",
			node.Data.Name, node.Data.IPAddress, node.Data.Status)

		ctx.markChildrenUnreachable(child, rootIncident)
	}
}

func (ctx *cycleContext) markChildrenPending(node *domain.Host) {
	node.Mutex.Lock()
	node.Data.Status = domain.StatusPending
	node.Mutex.Unlock()

	fmt.Printf("\nName: %s, IP Address: %s, Status: %s-%s",
		node.Data.Name, node.Data.IPAddress, node.Data.Status, domain.StatusUnreachable)

	for _, child := range node.Children {
		ctx.markChildrenPending(child)
	}
}

func generateRecoveryChildren(host *domain.Host, rootRecovery *domain.Recovery) {
	for _, child := range host.Children {
		if child.Data.Status == domain.StatusUp {
			rootRecovery.Impact.ChildrenCount++
			rootRecovery.Impact.ChildrenHosts = append(
				rootRecovery.Impact.ChildrenHosts, fmt.Sprintf("%s (%s)",
					child.Data.Name, child.Data.IPAddress))
		}

		generateRecoveryChildren(child, rootRecovery)
	}
}
