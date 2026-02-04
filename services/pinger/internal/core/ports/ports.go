package ports

import "pinger/internal/core/domain"

type DataRepository interface {
	GetBusinessConfig() (domain.BusinessConfig, error)
	GetHosts() ([]domain.HostDTO, error)
	UpdateHosts(hosts []domain.HostDTO) error
}

type NetworkPinger interface {
	UpdateConfigs(configs domain.BusinessConfig)
	ExecPing(ipAddress string) (domain.PingResult, error)
}

type AlarmProducer interface {
	PublishEvent(message []byte) error
}

type ConfigReloader interface {
	ReloadConfiguration() error
}
