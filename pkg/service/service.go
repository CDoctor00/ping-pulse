package service

import (
	"fmt"
	"ping-pulse/pkg/database"
	"ping-pulse/pkg/types"
	"ping-pulse/pkg/utils"
	"strings"
	"time"
)

var isRunning bool = false

func Start(stopChan chan<- error, messageChan chan<- string) {
	fmt.Println("PingPulse service started")

	configs, err := utils.GetSystemConfigs()
	if err != nil {
		stopChan <- fmt.Errorf("service.Start: %w", err)
		return
	}

	var ticker = time.NewTicker(time.Duration(configs.Pinger.RoutineDelay) * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		go routine(stopChan, messageChan)
	}
}

func routine(stopChan chan<- error, messageChan chan<- string) {
	if isRunning {
		return //don't execute more than one routine at the same time
	}

	isRunning = true

	//? Extract list of hosts
	var dbModel = database.Model{}
	dbModel.GetInstance()
	dbModel.StartTransaction()

	var hosts, err = dbModel.GetHosts()
	if err != nil {
		stopChan <- fmt.Errorf("service.routine: %w", err)
		return
	}

	//? Populate Tree
	var tree types.TreeNode

	err = tree.ParseFromArray(hosts)
	if err != nil {
		stopChan <- fmt.Errorf("service.routine: %w", err)
		return
	}

	err = dfsPing(&tree, true)
	if err != nil {
		stopChan <- fmt.Errorf("service.routine: %w", err)
		return
	}

	list, err := createMessage(&tree, "")
	if err != nil {
		stopChan <- fmt.Errorf("service.routine: %w", err)
		return
	}
	if list != "" {
		var message strings.Builder

		message.WriteString("<b>ERRORE DI SEGNALAZIONE</b>\n\n")
		message.WriteString("I seguenti host non hanno risposto ai ping:\n")
		message.WriteString("<pre>")
		message.WriteString(list[1:])
		message.WriteString("</pre>")

		messageChan <- message.String()
	}

	hosts = tree.ParseToArray()

	err = dbModel.InsertData(hosts)
	if err != nil {
		stopChan <- fmt.Errorf("service.routine: %w", err)
		return
	}

	err = dbModel.CommitTransaction()
	if err != nil {
		stopChan <- fmt.Errorf("service.routine: %w", err)
		return
	}
	fmt.Println("Data saved into DB")

	isRunning = false
}
