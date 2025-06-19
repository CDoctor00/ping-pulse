package bot

import (
	"fmt"
	"ping-pulse/pkg/utils"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func Start(stopChan chan<- error, messageChannel <-chan string) {
	//? getting system configs
	var configs, err = utils.GetSystemConfigs()
	if err != nil {
		stopChan <- fmt.Errorf("bot.Start: %w", err)
		return
	}

	//? initialize bot
	bot, err := tgbotapi.NewBotAPI(configs.Bot.TokenAPI)
	if err != nil {
		stopChan <- fmt.Errorf("bot.Start: %w", err)
		return
	}

	for message := range messageChannel {
		for _, chatID := range configs.Bot.ChatID {
			botMsg := tgbotapi.NewMessage(chatID, message)
			botMsg.ParseMode = tgbotapi.ModeHTML
			_, err = bot.Send(botMsg)
			if err != nil {
				stopChan <- fmt.Errorf("bot.Start: %w", err)
				return
			}
		}
	}
}
