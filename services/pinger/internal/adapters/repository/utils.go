package repository

import (
	"fmt"
	"pinger/internal/core/domain"
)

func createPlaceholders(items, fields int) string {
	var placeholders string

	startNum := 1

	for i := 0; i < items; i++ {
		itemPlaceholders := fmt.Sprintf("$%d", startNum)
		for j := 1; j < fields; j++ {
			itemPlaceholders = fmt.Sprintf("%s,$%d", itemPlaceholders, startNum+j)
		}
		startNum += fields
		placeholders = fmt.Sprintf("%s,\n(%s)", placeholders, itemPlaceholders)
	}

	return placeholders[2:]
}

func parseData(hosts []domain.HostDTO) []interface{} {
	var array = make([]interface{}, 0)

	for _, h := range hosts {
		array = append(array, h.ID)
		array = append(array, h.Status)
		array = append(array, h.LastPing)
		array = append(array, h.LastPulse)
		array = append(array, h.Stats.PingsCount)
		array = append(array, h.Stats.DisconnectionCount)
		array = append(array, h.Stats.AverageLatency)
		array = append(array, h.Stats.AveragePacketLoss)
	}

	return array
}
