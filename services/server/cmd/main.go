package main

import (
	"log"
	"server/config"
	"server/internal/adapters/inbound/http/handlers"
	"server/internal/adapters/inbound/http/server"
	"server/internal/adapters/outbound/messanger"
	"server/internal/adapters/outbound/repository"
	"server/internal/core/usecase"

	"github.com/streadway/amqp"
)

func main() {
	log.Println("PingPulse Pinger server")

	var sysConf, err = config.LoadSystem()
	if err != nil {
		log.Fatalf("Error during loading of system configs: %v", err)
	}

	//? Connection to database
	err = repository.OpenConnection(sysConf.DatabaseURL)
	if err != nil {
		log.Fatalf("Error during loading of system configs: %v", err)
	}

	//? Setup database adapter
	var clientDB = repository.GetInstance()
	var repoAdapter = repository.NewPostgresAdapter(clientDB)

	//? Setup RabbitMQ adapter
	conn, err := amqp.Dial(sysConf.RabbitMQURL)
	if err != nil {
		log.Fatalf("Error during connecting to RabbitMQ: %v", err)
	}
	var configsProducer = messanger.NewConfigProducer(conn)
	configsProducer.Init()

	//? Setup server dependencies
	var ucManger = usecase.NewManager(repoAdapter, configsProducer)
	var webHandler = handlers.NewWebHandler(ucManger)

	//? Setup server
	var app = server.NewServer(webHandler)
	app.SetupRoutes()

	//? Start server
	app.Start()
}
