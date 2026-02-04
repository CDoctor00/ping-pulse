package domain

type SystemConfig struct {
	Environment string `env:"ENVIRONMENT,required"`
	Version     string `env:"VERSION"`
	DatabaseURL string `env:"DB_SOURCE"`
	RabbitMQURL string `env:"RABBITMQ_URL"`
}

type BusinessConfig struct {
	PacketsCount               Config `json:"packets_count" validate:"required"`
	PacketSize                 Config `json:"packet_size" validate:"required"`
	PingsInterval              Config `json:"pings_interval" validate:"required"`
	PingsTimeout               Config `json:"pings_timeout" validate:"required"`
	RoutineDelay               Config `json:"routine_delay" validate:"required"`
	PendingThreshold           Config `json:"pending_threshold" validate:"required"`
	NotificationRepeatInterval Config `json:"notification_repeat_interval" validate:"required"`
}

type Config struct {
	Key         string `json:"key" validate:"required,alphanum,max=50"`
	Value       int    `json:"value" validate:"required,gte=0"`
	Description string `json:"description" validate:"required,max=500"`
}
