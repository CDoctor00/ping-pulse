package monitoring

import (
	"fmt"
	"pinger/internal/core/domain"
	"pinger/internal/core/ports"
	"time"

	probing "github.com/prometheus-community/pro-bing"
)

type ProbingAdapter struct {
	PacketsCount int
	PacketSize   int
	Interval     int
	Timeout      int
}

func NewProbingAdapter(packteCounts, packetSize, interval, timeout int) *ProbingAdapter {
	return &ProbingAdapter{
		PacketsCount: packteCounts,
		PacketSize:   packetSize,
		Interval:     interval,
		Timeout:      timeout,
	}
}

var _ ports.NetworkPinger = (*ProbingAdapter)(nil)

func (p *ProbingAdapter) UpdateConfigs(configs domain.BusinessConfig) {
	p.PacketsCount = configs.PacketsCount.Value
	p.PacketSize = configs.PacketSize.Value
	p.Interval = configs.PingsInterval.Value
	p.Timeout = configs.PingsTimeout.Value
}

func (p *ProbingAdapter) ExecPing(hostIP string) (domain.PingResult, error) {
	var result = domain.PingResult{
		IPAddress: hostIP,
		Timestamp: time.Now(),
	}

	for i := 0; i < p.PacketsCount; i++ {
		pinger, err := probing.NewPinger(hostIP)
		if err != nil {
			return domain.PingResult{}, fmt.Errorf("monitoring.ExecPing: %w", err)
		}

		pinger.Count = 1
		pinger.Size = p.PacketSize
		pinger.Timeout = time.Duration(p.Timeout) * time.Millisecond
		pinger.RecordRtts = false

		err = pinger.Run()
		if err != nil {
			return domain.PingResult{}, fmt.Errorf("monitoring.ExecPing: %w", err)
		}

		result.PacketsSent++
		stats := pinger.Statistics()
		if stats.PacketsRecv > 0 {
			result.PacketsReceived++

			result.AverageLatency += float64(stats.AvgRtt.Nanoseconds()) / 1e6 //?Milliseconds
			result.IsReachable = true
		} else {
			result.IsReachable = false
		}

		//? Need to use time.Sleep beacuse ticker could not wait the ping time expire before execute again the next ping
		if i < p.PacketsCount-1 {
			time.Sleep(time.Duration(p.Interval) * time.Millisecond)
		}
	}

	if result.PacketsSent > 0 {
		result.AveragePacketLoss = float64((result.PacketsSent - result.PacketsReceived)) / float64(result.PacketsSent) * 100
	}
	if result.PacketsReceived > 0 {
		result.AverageLatency = result.AverageLatency / float64(result.PacketsReceived)
	}

	return result, nil
}
