package types

type Configs struct {
	Pinger PingerConfigs
	Bot    BotConfigs
}

type BotConfigs struct {
	TokenAPI string
	ChatID   []int64
}

type PingerConfigs struct {
	RoutineDelay  int
	PingsInterval int
}
