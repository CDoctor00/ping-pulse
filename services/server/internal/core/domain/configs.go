package domain

type SystemConfig struct {
	Environment string `env:"ENVIRONMENT,required"`
	Version     string `env:"VERSION"`
	DatabaseURL string `env:"DB_SOURCE"`
	RabbitMQURL string `env:"RABBITMQ_URL"`
}

type BusinessConfig struct {
	PacketsCount               Config `json:"packetsCount" validate:"required"`
	PacketSize                 Config `json:"packetSize" validate:"required"`
	PingsInterval              Config `json:"pingsInterval" validate:"required"`
	PingsTimeout               Config `json:"pingsTimeout" validate:"required"`
	RoutineDelay               Config `json:"routineDelay" validate:"required"`
	PendingThreshold           Config `json:"pendingThreshold" validate:"required"`
	NotificationRepeatInterval Config `json:"notificationRepeatInterval" validate:"required"`
}

type Config struct {
	Name        string `json:"name" validate:"required,max=50"`
	Value       int    `json:"value" validate:"required,gte=0"`
	Description string `json:"description" validate:"required,max=500"`
}
