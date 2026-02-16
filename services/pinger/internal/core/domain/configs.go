package domain

type SystemConfig struct {
	Environment string `env:"ENVIRONMENT,required"`
	Version     string `env:"VERSION"`
	DatabaseURL string `env:"DB_SOURCE"`
	RabbitMQURL string `env:"RABBITMQ_URL"`
}

type BusinessConfig struct {
	PacketsCount     Config `json:"packetsCount"`
	PacketSize       Config `json:"packetSize"`
	PingsInterval    Config `json:"pingsInterval"`
	PingsTimeout     Config `json:"pingsTimeout"`
	RoutineDelay     Config `json:"routineDelay"`
	PendingThreshold Config `json:"pendingThreshold"`
}

type Config struct {
	Name        string `json:"name"`
	Value       int    `json:"value"`
	Description string `json:"description"`
}
