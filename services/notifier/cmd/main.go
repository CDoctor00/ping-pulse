package main

import (
	"log"
	"notifier/config"
	inNotifier "notifier/internal/adapters/inbound/notifier"
	"notifier/internal/adapters/outbound/messanger"
	outNotifier "notifier/internal/adapters/outbound/notifier"
	"notifier/internal/adapters/outbound/repository"
	"notifier/internal/core/service"

	"github.com/streadway/amqp"
)

func main() {
	log.Println("PingPulse Notifier service")

	var sysConf, err = config.LoadSystem()
	if err != nil {
		log.Fatalf("Error during loading of system configs: %v", err)
	}

	//? RabbitMQ connection init
	conn, err := amqp.Dial(sysConf.RabbitMQURL)
	if err != nil {
		log.Fatalf("Error during connecting to RabbitMQ: %v", err)
	}
	var consumerNetwork = messanger.NewConsumerNetwork(conn)
	consumerNetwork.Init()

	//? Connection to database
	err = repository.OpenConnection(sysConf.DatabaseURL)
	if err != nil {
		log.Fatalf("Error during loading of system configs: %v", err)
	}

	//? Getting the configs saved in the database
	var clientDB = repository.GetInstance()
	var repoAdapter = repository.NewPostgresAdapter(clientDB)
	busConf, err := repoAdapter.GetBusinessConfigs()
	if err != nil {
		log.Fatalf("Error during loading of business configs: %v", err)
	}

	//? Initialize telegram bot
	var outTgAdapter = outNotifier.NewTelegramAdapter(
		sysConf.TelegramBotAPI)

	var coreManager = service.NewCoreLogicManager(
		outTgAdapter, repoAdapter, sysConf.TelegramChatIDs)

	var inTgAdapter = inNotifier.NewTelegramAdapter(
		sysConf.TelegramBotAPI, coreManager)

	err = consumerNetwork.StartConsuming(coreManager)
	if err != nil {
		log.Fatalf("Error during start RabbitMQ consumer: %v", err)
	}

	coreManager.RunCheckAlarm(busConf.NotificationRepeatInterval.Value)

	//? Start Telegram bot service
	inTgAdapter.Run()
}
