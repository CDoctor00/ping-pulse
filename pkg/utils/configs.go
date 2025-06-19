package utils

import (
	"fmt"
	"ping-pulse/pkg/database"
	"ping-pulse/pkg/types"
	"strconv"
	"strings"
	"sync"
)

// ? Bot constant config keys
const (
	botToken  string = "BOT_API_TOKEN"
	botChatID string = "BOT_CHAT_ID"
)

// ? Pinger constant configs keys
const (
	pingerRoutineDelay  string = "PINGER_ROUTINE_DELAY"
	pingerPingsInterval string = "PINGER_PINGS_INTERVAL"
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
		delay, errParse := strconv.Atoi(mapConfigs[pingerPingsInterval])
		if errParse != nil {
			err = fmt.Errorf("utils.GetSystemConfigs: (Pinger Pings Interval) %w", errParse)
			return
		}
		configs.Pinger.PingsInterval = delay

		delay, errParse = strconv.Atoi(mapConfigs[pingerRoutineDelay])
		if errParse != nil {
			err = fmt.Errorf("utils.GetSystemConfigs: (Pinger Routine Delay) %w", errParse)
			return
		}
		configs.Pinger.RoutineDelay = delay

		configs.Bot.TokenAPI = mapConfigs[botToken]
		if configs.Bot.TokenAPI == "" {
			err = fmt.Errorf("utils.GetSystemConfigs: Bot Token API empty")
			return
		}

		for _, id := range strings.Split(mapConfigs[botChatID], ",") {
			chatID, errParse := strconv.ParseInt(id, 10, 64)
			if configs.Bot.TokenAPI == "" {
				err = fmt.Errorf("utils.GetSystemConfigs: (Bot Chat ID) %w", errParse)
				return
			}
			configs.Bot.ChatID = append(configs.Bot.ChatID, chatID)
		}
	})

	if err != nil {
		return types.Configs{}, err
	}

	return configs, nil
}
