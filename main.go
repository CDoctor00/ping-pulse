package main

import (
	"fmt"
	"os"
	"os/signal"
	"ping-pulse/pkg/bot"
	"ping-pulse/pkg/database"
	"ping-pulse/pkg/service"
	"syscall"
)

func main() {
	fmt.Println("Starting PingPulse program")

	var (
		osSigChan   = make(chan os.Signal, 1) //Channel to listen os termination signals
		serviceChan = make(chan error, 1)     //Channel to comunicate termination signal (listen and send from/to sub routines)
		messageChan = make(chan string, 1)    //Channel to send message from service to bot and notify it
	)
	signal.Notify(osSigChan, syscall.SIGINT, syscall.SIGTERM)

	// ? Database initialization
	var errDB = database.OpenConnection()
	if errDB != nil {
		fmt.Println(errDB)
		os.Exit(-1)
	}

	go service.Start(serviceChan, messageChan)
	go bot.Start(serviceChan, messageChan)

	select {
	case sig := <-osSigChan:
		fmt.Printf("\nOS termination signal received: %v. PingPulse is shutdowing...\n", sig)
	case err := <-serviceChan:
		fmt.Printf("\nService termination error received: %v. PingPulse is shutdowing...\n", err)
	}

	//? Graceful shutdown
	close(osSigChan)
	close(serviceChan)
	close(messageChan)

	database.CloseConnection()

	fmt.Println("PingPulse program shutdown")
}
