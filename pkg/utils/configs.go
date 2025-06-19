package utils

import (
	"fmt"
	"ping-pulse/pkg/database"
	"ping-pulse/pkg/types"
	"strconv"
	"sync"
)

// ? Bot constant config keys
const (
	botToken  string = "BOT_API_TOKEN"
	botChatID string = "BOT_CHAT_ID"
)

// ? Pinger constant configs keys
const (
	pingerRoutineDelay string = "PINGER_ROUTINE_DELAY"
	pingerPingsDelay   string = "PINGER_PINGS_DELAY"
)

var (
	configs types.Configs
	once    sync.Once
)

func GetSystemConfigs() (types.Configs, error) {
	var err error

	once.Do(func() {
		//? getting configs
		var dbModel = database.Model{}
		dbModel.GetInstance()

		var mapConfigs, errGet = dbModel.GetConfigs()
		if errGet != nil {
			err = fmt.Errorf("utils.GetSystemConfigs: %w", errGet)
			return
		}

		//? parsing configs from map to object
		delay, errParse := strconv.Atoi(mapConfigs[pingerPingsDelay])
		if errParse != nil {
			err = fmt.Errorf("utils.GetSystemConfigs: (Pinger Pings Delay) %w", errParse)
			return
		}
		configs.Pinger.PingsDelay = delay

		delay, errParse = strconv.Atoi(mapConfigs[pingerRoutineDelay])
		if errParse != nil {
			err = fmt.Errorf("utils.GetSystemConfigs: (Pinger Routine Delay) %w", errParse)
			return
		}
		configs.Pinger.RoutineDelay = delay

		configs.Bot = types.BotConfigs{
			TokenAPI: mapConfigs[botToken],
			ChatID:   mapConfigs[botChatID],
		}
	})

	if err != nil {
		return types.Configs{}, err
	}

	return configs, nil
}
