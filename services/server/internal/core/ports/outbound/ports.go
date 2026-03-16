package outbound

import "server/internal/core/domain"

type DataRepository interface {
	GetConfigs() (domain.BusinessConfig, error)
	UpdateConfigs(configs domain.BusinessConfig) error

	GetHost(hostID int) (domain.HostDTO, error)
	GetHosts() ([]domain.HostDTO, error)
	AddHosts(hosts []domain.NewHost) error
	UpdateHosts(hosts []domain.HostDTO) error
	DeleteHosts(hostsID []int) error
	IsNameAlreadyUsed(name string) (bool, error)
	IpAddressExists(ipAddress string) (bool, error)

	GetAlarmByID(id int) (domain.AlarmDTO, error)
	GetAlarms() ([]domain.AlarmDTO, error)
	DeleteAlarms(alarmsID []int) error
}

type UpdateConfigProducer interface {
	PublishEvent(message []byte) error
}
