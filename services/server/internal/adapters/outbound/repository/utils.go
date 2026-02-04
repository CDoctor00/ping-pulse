package repository

import (
	"fmt"
	"server/internal/core/domain"
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

func parseDataToUpdate(hosts []domain.HostDTO) []any { //TODO change
	var array = make([]any, 0)

	for _, h := range hosts {
		array = append(array, h.ID)
		array = append(array, h.Status)
		array = append(array, h.LastPing)
		array = append(array, h.LastPulse)
		array = append(array, h.PingsCount)
		array = append(array, h.DisconnectionCount)
		array = append(array, h.AverageLatency)
		array = append(array, h.AveragePacketLoss)
	}

	return array
}

func parseDataToInsert(hosts []domain.NewHost) []any {
	var array = make([]any, 0)

	for _, h := range hosts {
		array = append(array, h.IPAddress)
		array = append(array, h.Name)
		array = append(array, h.Note)
		array = append(array, h.ParentIP)
	}

	return array
}
