package service

import (
	"fmt"
	"log"
	"notifier/internal/core/domain"
	"notifier/internal/core/ports/inbound"
	"notifier/internal/core/ports/outbound"
	"strconv"
	"strings"
	"time"
)

type CoreLogicManager struct {
	chatIDs    []int64
	notifier   outbound.Notifier
	repository outbound.DataRepository
}

func NewCoreLogicManager(
	notifier outbound.Notifier, repo outbound.DataRepository, chatIDs []int64) CoreLogicManager {
	return CoreLogicManager{
		chatIDs:    chatIDs,
		notifier:   notifier,
		repository: repo,
	}
}

var _ inbound.EventManager = (*CoreLogicManager)(nil)

func (c CoreLogicManager) HandleReportEvent(report domain.CycleReport) error {
	//? Reconnections
	if len(report.Recoveries) > 0 {
		//? Building text message
		var body = "🟢 *RICONNESSIONE* 🟢\n"

		for _, r := range report.Recoveries {
			log.Printf("Received riconnection event caused by: %s (%s)",
				r.HostName, r.HostIP)

			//? Retrieving alarm data
			alarm, err := c.repository.GetActiveAlarmByHost(r.HostIP)
			if err != nil {
				return fmt.Errorf("service.HandleNetworkEvent: %w", err)
			}

			if err = c.repository.SetAlarmResolved(alarm.ID); err != nil {
				return fmt.Errorf("service.HandleNetworkEvent: %w", err)
			}

			body = fmt.Sprintf("%s\n\\-\\-\\-\n%s", body, createBodyMessage(r))
		}

		//? Sending messages
		for _, chatID := range c.chatIDs {
			_, err := c.notifier.SendMessage(
				domain.MessageData{
					ChatID:   chatID,
					Body:     body,
					Keyboard: nil},
			)
			if err != nil {
				return fmt.Errorf("service.HandleReportEvent: %w", err)
			}
		}
	}

	//? Disconnections
	for _, i := range report.Incidents {
		log.Printf("Received disconnection event caused by: %s (%s)",
			i.HostName, i.HostIP)

		timestamp, _ := time.Parse(time.RFC3339, report.Timestamp)
		alarm, err := c.repository.AddAlarm(i.HostIP, timestamp)
		if err != nil {
			return fmt.Errorf("service.HandleNetworkEvent: %w", err)
		}

		//? Building text message
		var body = fmt.Sprintf("🔴 *DISCONNESSIONE* 🔴\n%s", createBodyMessage(i))

		var messageInfo = domain.MessageInfo{
			Body:  body,
			Users: make([]domain.UserInfo, len(c.chatIDs)),
		}

		//? Sending messages
		for i, chatID := range c.chatIDs {
			messageUser, err := c.notifier.SendMessage(
				domain.MessageData{
					ChatID: chatID,
					Body:   body,
					Keyboard: &domain.MessageKeyboard{
						Text:   "Segna come ricevuto",
						Action: fmt.Sprintf("Acknowledged:%d", alarm.ID),
					},
				})
			if err != nil {
				return fmt.Errorf("service.HandleReportEvent: %w", err)
			}
			messageInfo.Users[i] = messageUser
		}

		err = c.repository.SetAlarmMessageInfo(alarm.ID, messageInfo)
		if err != nil {
			return fmt.Errorf("service.HandleReportEvent: %w", err)
		}
	}

	return nil
}

func (c CoreLogicManager) HandleNotifierEvent(
	eventData string, chatID int64, messageID int, callbackID string) error {
	data := strings.Split(eventData, ":")
	action := data[0]
	switch action {
	case "Acknowledged":
		{
			//? Updating data on db
			alarmID, _ := strconv.Atoi(data[1])
			alarm, err := c.repository.GetAlarmByID(alarmID)
			if err != nil {
				return fmt.Errorf("service.HandleNotifierEvent: %w", err)
			}

			isAcknowledged := true
			update := false
			for i, user := range alarm.MessageInfo.Users {
				if user.ChatID == chatID {
					timestamp := time.Now().Format(time.RFC3339)
					user.AckTime = &timestamp
					alarm.MessageInfo.Users[i] = user
					update = true
				}

				if user.AckTime == nil {
					isAcknowledged = false
				}
			}
			if isAcknowledged {
				if err := c.repository.SetAlarmAcknowledged(alarmID); err != nil {
					return fmt.Errorf("service.HandleNotifierEvent: %w", err)
				}
			}
			if update {
				err = c.repository.SetAlarmMessageInfo(alarm.ID, alarm.MessageInfo)
				if err != nil {
					log.Printf("Error occurred during substituction of alert message: %v", err)
				}
			}

			//? Updating message on bot
			if err = c.notifier.RemoveKeyboard(chatID, messageID); err != nil {
				return fmt.Errorf("service.HandleNotifierEvent: %w", err)
			}

			if err = c.notifier.SendCallbackAnswer(
				callbackID, "Segnato come ricevuto"); err != nil {
				return fmt.Errorf("service.HandleNotifierEvent: %w", err)
			}
		}
	default:
		{
			if err := c.notifier.SendCallbackAnswer(
				callbackID, "Action not allowed"); err != nil {
				return fmt.Errorf("service.HandleNotifierEvent: %w", err)
			}
		}
	}

	return nil
}

func (c CoreLogicManager) RunCheckAlarm(delayTime int) {
	var ticker = time.NewTicker(60 * time.Second)

	go func() {
		for range ticker.C {
			alarms, err := c.repository.GetAllPendingAlarms()
			if err != nil {
				log.Printf("Error occurred during getting alarms from db: %v", err)
			}

			for _, alarm := range alarms {
				update := false

				for i, user := range alarm.MessageInfo.Users {
					timestamp, _ := time.Parse(time.RFC3339, user.SentTime)
					if time.Since(timestamp) < time.Duration(delayTime)*time.Second {
						continue
					}

					if user.AckTime == nil {
						if err = c.notifier.DeleteMessage(user.ChatID, user.MessageID); err != nil {
							log.Printf("Error occurred during substituction of alert message: %v", err)
						}

						newUserInfo, err := c.notifier.SendMessage(
							domain.MessageData{
								ChatID: user.ChatID,
								Body:   alarm.MessageInfo.Body,
								Keyboard: &domain.MessageKeyboard{
									Text:   "Segna come ricevuto",
									Action: fmt.Sprintf("Acknowledged:%d", alarm.ID),
								},
							})
						if err != nil {
							log.Printf("Error occurred during substituction of alert message: %v", err)
						}

						alarm.MessageInfo.Users[i] = newUserInfo
						update = true
					}
				}

				if update {
					err = c.repository.SetAlarmMessageInfo(alarm.ID, alarm.MessageInfo)
					if err != nil {
						log.Printf("Error occurred during substituction of alert message: %v", err)
					}
				}
			}
		}
	}()
}
