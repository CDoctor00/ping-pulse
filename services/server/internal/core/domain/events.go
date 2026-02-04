package domain

type ConfigsEvent struct {
	EventType string `json:"event_type"` // "configs_updated" / "network_updated"
	Timestamp string `json:"timestamp"`  //datetime=2006-01-02T15:04:05Z07:00
}
