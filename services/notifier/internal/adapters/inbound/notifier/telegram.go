package notifier

import (
	"notifier/internal/core/ports/inbound"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

type TelegramAdapter struct {
	tokenAPI     string
	bot          *tgbotapi.BotAPI
	eventManager inbound.EventManager
}

func NewTelegramAdapter(tokenAPI string, eventManager inbound.EventManager) *TelegramAdapter {
	bot, _ := tgbotapi.NewBotAPI(tokenAPI)
	return &TelegramAdapter{
		tokenAPI:     tokenAPI,
		eventManager: eventManager,
		bot:          bot,
	}
}

func (a *TelegramAdapter) Run() {
	var updates = a.bot.GetUpdatesChan(tgbotapi.NewUpdate(0))

	for update := range updates {
		if update.CallbackQuery != nil {
			a.eventManager.HandleNotifierEvent(
				update.CallbackQuery.Data,
				update.CallbackQuery.Message.Chat.ID,
				update.CallbackQuery.Message.MessageID,
				update.CallbackQuery.ID,
			)
		}
	}
}
