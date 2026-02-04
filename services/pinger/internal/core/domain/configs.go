package domain

type SystemConfig struct {
	Environment string `env:"ENVIRONMENT,required"`
	Version     string `env:"VERSION"`
	DatabaseURL string `env:"DB_SOURCE"`
	RabbitMQURL string `env:"RABBITMQ_URL"`
}

type BusinessConfig struct {
	PacketsCount     Config `json:"packets_count"`
	PacketSize       Config `json:"packet_size"`
	PingsInterval    Config `json:"pings_interval"`
	PingsTimeout     Config `json:"pings_timeout"`
	RoutineDelay     Config `json:"routine_delay"`
	PendingThreshold Config `json:"pending_threshold"`
}

type Config struct {
	Name        string `json:"name"`
	Value       int    `json:"value"`
	Description string `json:"description"`
}
