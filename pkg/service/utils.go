package service

import (
	"database/sql"
	"fmt"
	"ping-pulse/pkg/types"
	"time"

	probing "github.com/prometheus-community/pro-bing"
)

func dfsPing(root *types.TreeNode, isParentConnected bool) error {
	var (
		avgPacketLoss int = 100
		avgLatency    int
		pingTime      = time.Now().Format(time.RFC3339)
	)
	if isParentConnected {
		pinger, errNew := probing.NewPinger(root.Value.IPAddress)
		if errNew != nil {
			return fmt.Errorf("system.DFSPing: %w", errNew)
		}

		//? Pinger configuration
		pinger.Count = 3
		pinger.Interval = 150 * time.Millisecond
		pinger.Timeout = 5 * time.Second

		errPing := pinger.Run()
		if errPing != nil {
			return fmt.Errorf("system.DFSPing: %w", errPing)
		}

		var stats = pinger.Statistics()

		avgPacketLoss = int(stats.PacketLoss)
	}

	root.Value.PingsCount++
	root.Value.LastPing = sql.NullString{
		Valid:  true,
		String: pingTime,
	}
	root.Value.AveragePacketLoss = (root.Value.AveragePacketLoss * (root.Value.PingsCount - 1)) + avgPacketLoss/root.Value.PingsCount

	if avgPacketLoss < 100 {
		root.Value.LastPulse = sql.NullString{
			Valid:  true,
			String: pingTime,
		}
		root.Value.Status = "on"
		root.Value.Notified = false
	} else {
		root.Value.AverageLatency = ((root.Value.AverageLatency * (root.Value.PingsCount - 1)) + avgLatency) / root.Value.PingsCount
		root.Value.DisconnectionCount++
		root.Value.Status = "off"
	}

	fmt.Printf("Ping : %+v\n", root.Value)

	for _, child := range root.Children {
		newNode := dfsPing(child, avgPacketLoss < 100)
		if newNode != nil {
			return newNode
		}
	}

	return nil
}

func createMessage(root *types.TreeNode, msgPrefix string) (string, error) {
	var message string

	msgPrefix += "\t"

	for _, child := range root.Children {
		childMessage, errCheck := createMessage(child, msgPrefix)
		if errCheck != nil {
			return message, fmt.Errorf("service.createMessage: %w", errCheck)
		}
		message = message + childMessage
	}

	if root.Value.Status == "off" && !root.Value.Notified {
		timePing, errPing := time.Parse(time.RFC3339, root.Value.LastPing.String)
		timePulse, errPulse := time.Parse(time.RFC3339, root.Value.LastPulse.String)
		if errPing != nil || errPulse != nil {
			return message,
				fmt.Errorf("service.createMessage: (Ping: %w) - (Pulse: %w)", errPing, errPulse)
		}
		timeDifference := int(timePing.Sub(timePulse).Minutes())

		if timeDifference > 1 {
			root.Value.Notified = true

			if len(root.Children) == 0 {
				return fmt.Sprintf("\n%s• %s (%s): OFF for %d minutes", msgPrefix,
					root.Value.Name, root.Value.IPAddress, timeDifference), nil
			}

			message = fmt.Sprintf("\n%s• %s (%s): OFF for %d minutes %s", msgPrefix,
				root.Value.Name, root.Value.IPAddress, timeDifference, message)
		}
	} else {
		if message != "" {
			message = fmt.Sprintf("\n%s• %s (%s): ON %s", msgPrefix,
				root.Value.Name, root.Value.IPAddress, message)
		}
	}

	return message, nil
}
