package domain

type SystemConfig struct {
	Environment     string  `env:"ENVIRONMENT,required"`
	Version         string  `env:"VERSION"`
	DatabaseURL     string  `env:"DB_SOURCE"`
	RabbitMQURL     string  `env:"RABBITMQ_URL"`
	TelegramBotAPI  string  `env:"TELEGRAM_BOT_API"`
	TelegramChatIDs []int64 `env:"TELEGRAM_CHAT_IDS"`
}

type BusinessConfig struct {
	NotificationRepeatInterval Config `json:"notification_repeat_interval" validate:"required"`
}

type Config struct {
	Key         string `json:"key" validate:"required,alphanum,max=50"`
	Value       int    `json:"value" validate:"required,gte=0"`
	Description string `json:"description" validate:"required,max=500"`
}
