package types

type Configs struct {
	Pinger PingerConfigs
	Bot    BotConfigs
}

type BotConfigs struct {
	TokenAPI string
	ChatID   string
}

type PingerConfigs struct {
	RoutineDelay int
	PingsDelay   int
}
