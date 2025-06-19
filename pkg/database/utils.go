package database

import (
	"fmt"
	"ping-pulse/pkg/types"
	"strings"
)

func createRowPlaceholders(argumentCount int) string {
	var placeholders = []string{}

	for range argumentCount {
		placeholders = append(placeholders, "?")
	}

	return fmt.Sprintf("(%s)", strings.Join(placeholders, ", "))
}

func createQueryPlaceholders(argumentCount int, rowsCount int) string {
	var placeholders = createRowPlaceholders(argumentCount)

	for i := 1; i < rowsCount; i++ {
		placeholders = fmt.Sprintf("%s, %s",
			placeholders, createRowPlaceholders(argumentCount))
	}

	return placeholders
}

func createArguments(hosts []types.Host) []interface{} {
	var args = []interface{}{}

	for _, host := range hosts {
		args = append(args, host.AddedAt)
		args = append(args, host.AverageLatency)
		args = append(args, host.AveragePacketLoss)
		args = append(args, host.Description)
		args = append(args, host.DisconnectionCount)
		args = append(args, host.IPAddress)
		args = append(args, host.LastPing)
		args = append(args, host.LastPulse)
		args = append(args, host.Name)
		args = append(args, host.Notified)
		args = append(args, host.ParentIP)
		args = append(args, host.PingsCount)
		args = append(args, host.Status)
	}

	return args
}
