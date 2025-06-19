package bot

import (
	"fmt"
	"ping-pulse/pkg/utils"
	"strconv"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func Start(stopChan chan<- error, messageChannel <-chan string) {
	//? getting system configs
	var configs, err = utils.GetSystemConfigs()
	if err != nil {
		stopChan <- fmt.Errorf("bot.Start: %w", err)
		return
	}

	//? check bot configs are populated
	if configs.Bot.TokenAPI == "" {
		stopChan <- fmt.Errorf("bot.Start: api token missing")
		return
	}
	if configs.Bot.ChatID == "" {
		stopChan <- fmt.Errorf("bot.Start: chat ID missing")
		return
	}
	chatID, errAtoi := strconv.Atoi(configs.Bot.ChatID)
	if errAtoi != nil {
		stopChan <- fmt.Errorf("bot.Start: %w", errAtoi)
		return
	}

	//? initialize bot
	bot, err := tgbotapi.NewBotAPI(configs.Bot.TokenAPI)
	if err != nil {
		stopChan <- fmt.Errorf("bot.Start: %w", err)
		return
	}

	for message := range messageChannel {
		botMsg := tgbotapi.NewMessage(int64(chatID), message)
		botMsg.ParseMode = tgbotapi.ModeHTML
		_, err = bot.Send(botMsg)
		if err != nil {
			stopChan <- fmt.Errorf("bot.Start: %w", err)
			return
		}
	}
}
