package messanger

import (
	"encoding/json"
	"fmt"
	"log"
	"notifier/internal/core/domain"
	"notifier/internal/core/ports/inbound"
)

func (c *consumer) Init() error {
	if err := c.exchange.setup(c.channel); err != nil {
		return fmt.Errorf("messanger.Init: %w", err)
	}

	if err := c.setupQueue(); err != nil {
		return fmt.Errorf("messanger.Init: %w", err)
	}

	return nil
}

func (c *consumer) setupQueue() error {
	if _, err := c.channel.QueueDeclare(
		c.configs.queueName,
		c.configs.durable,
		c.configs.autoDelete,
		c.configs.exclusive,
		c.configs.noWait,
		c.configs.args,
	); err != nil {
		return fmt.Errorf("messanger.SetupQueue: %w", err)
	}

	if err := c.channel.QueueBind(
		c.configs.queueName,
		c.configs.bindingKey,
		c.exchange.name,
		c.configs.noWait,
		c.configs.args,
	); err != nil {
		return fmt.Errorf("messanger.SetupQueue: %w", err)
	}

	return nil
}

func (c *consumer) StartConsuming(receiver inbound.EventManager) error {
	var deliveries, err = c.channel.Consume(
		c.configs.queueName,
		"",
		true,
		c.configs.exclusive,
		false,
		c.configs.noWait,
		nil,
	)
	if err != nil {
		return fmt.Errorf("messanger.StartConsuming: %w", err)
	}

	go func() {
		for d := range deliveries {
			var report domain.CycleReport
			json.Unmarshal(d.Body, &report)
			err := receiver.HandleReportEvent(report)
			if err != nil {
				log.Println(err)
			}

		}
	}()

	return nil
}
