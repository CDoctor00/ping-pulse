package notifier

import (
	"fmt"
	"notifier/internal/core/domain"
	"notifier/internal/core/ports/outbound"
	"time"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

type TelegramAdapter struct {
	tokenAPI string
	bot      *tgbotapi.BotAPI
}

var _ outbound.Notifier = (*TelegramAdapter)(nil)

func NewTelegramAdapter(tokenAPI string) *TelegramAdapter {
	bot, _ := tgbotapi.NewBotAPI(tokenAPI)
	return &TelegramAdapter{
		tokenAPI: tokenAPI,
		bot:      bot,
	}
}

func (a *TelegramAdapter) SendMessage(message domain.MessageData) (domain.UserInfo, error) {
	var messageConfig = tgbotapi.NewMessage(message.ChatID, message.Body)
	messageConfig.ParseMode = tgbotapi.ModeMarkdownV2

	if message.Keyboard != nil {
		keyboard := tgbotapi.NewInlineKeyboardMarkup(
			tgbotapi.NewInlineKeyboardRow(
				tgbotapi.NewInlineKeyboardButtonData(
					message.Keyboard.Text, message.Keyboard.Action),
			),
		)
		messageConfig.ReplyMarkup = keyboard
	}

	messageSent, err := a.bot.Send(messageConfig)
	if err != nil {
		return domain.UserInfo{}, fmt.Errorf("notifier.SendMessage: %w", err)
	}

	return domain.UserInfo{
		MessageID: messageSent.MessageID,
		ChatID:    messageSent.Chat.ID,
		SentTime:  messageSent.Time().Format(time.RFC3339),
	}, nil
}

func (a *TelegramAdapter) RemoveKeyboard(chatID int64, messageID int) error {
	editMarkup := tgbotapi.NewEditMessageReplyMarkup(
		chatID, messageID,
		tgbotapi.InlineKeyboardMarkup{
			InlineKeyboard: [][]tgbotapi.InlineKeyboardButton{}},
	)

	if _, err := a.bot.Send(editMarkup); err != nil {
		return fmt.Errorf("Error during updating message: %w", err)
	}

	return nil
}

func (a *TelegramAdapter) SendCallbackAnswer(callbackID string, message string) error {
	callbackAnswer := tgbotapi.NewCallback(callbackID, message)
	if _, err := a.bot.Request(callbackAnswer); err != nil {
		return fmt.Errorf("Error during callback action: %w", err)
	}

	return nil
}

func (a *TelegramAdapter) DeleteMessage(chatID int64, messageID int) error {
	delConfig := tgbotapi.NewDeleteMessage(chatID, messageID)

	if _, err := a.bot.Request(delConfig); err != nil {
		return fmt.Errorf("notifier.DeleteMessage: %w", err)
	}

	return nil
}
