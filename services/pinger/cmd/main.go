package main

import (
	"fmt"
	"log"
	"pinger/config"
	"pinger/internal/adapters/messanger"
	"pinger/internal/adapters/monitoring"
	"pinger/internal/adapters/repository"
	"pinger/internal/core/domain"
	"pinger/internal/service"

	"github.com/streadway/amqp"
)

const banner = `
██████╗ ██╗███╗   ██╗ ██████╗ ███████╗██████╗ 
██╔══██╗██║████╗  ██║██╔════╝ ██╔════╝██╔══██╗
██████╔╝██║██╔██╗ ██║██║  ███╗█████╗  ██████╔╝
██╔═══╝ ██║██║╚██╗██║██║   ██║██╔══╝  ██╔══██╗
██║     ██║██║ ╚████║╚██████╔╝███████╗██║  ██║
╚═╝     ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
`

func main() {

	fmt.Println("\033[36m" + banner + "\033[0m")

	var sysConf, err = config.LoadSystem()
	if err != nil {
		log.Fatalf("Error during loading of system configs: %v", err)
	}

	//? RabbitMQ connection init
	conn, err := amqp.Dial(sysConf.RabbitMQURL)
	if err != nil {
		log.Fatalf("Error during connecting to RabbitMQ: %v", err)
	}
	var alarmProducer = messanger.NewAlarmProducer(conn)
	alarmProducer.Init()
	var configConsumer = messanger.NewConfigConsumer(conn)
	configConsumer.Init()

	//? Connection to database
	err = repository.OpenConnection(sysConf.DatabaseURL)
	if err != nil {
		log.Fatalf("Error during loading of system configs: %v", err)
	}

	//? Getting the configs saved in the database
	var clientDB = repository.GetInstance()
	var repoAdapter = repository.NewPostgresAdapter(clientDB)
	busConf, err := repoAdapter.GetBusinessConfig()
	if err != nil {
		log.Fatalf("Error during loading of business configs: %v", err)
	}

	//? Retrieve hosts to build the network
	hosts, err := repoAdapter.GetHosts()
	if err != nil {
		log.Fatalf("Error during loading of business configs: %v", err)
	}

	//? Setup monitoring service
	probingAdapter := monitoring.NewProbingAdapter(
		busConf.PacketsCount.Value,
		busConf.PacketSize.Value,
		busConf.PingsInterval.Value,
		busConf.PingsTimeout.Value)
	var monitoringService = service.NewMonitoringService(
		busConf, domain.NewNetwork(hosts), repoAdapter, probingAdapter, alarmProducer)

	//? Start rabbitMQ event consumer
	err = configConsumer.StartConsuming(monitoringService)
	if err != nil {
		log.Fatalf("Error during start RabbitMQ consumer: %v", err)
	}

	//? Start the monitoring service
	monitoringService.Run()
}
