package messanger

import (
	"fmt"
	"pinger/internal/core/ports"
)

func (c *consumer) Init() error {
	if err := c.exchange.setup(c.channel); err != nil {
		return fmt.Errorf("messanger.Init: %w", err)
	}

	if _, err := c.channel.QueueDeclare(
		c.configs.queueName,
		c.configs.durable,
		c.configs.autoDelete,
		c.configs.exclusive,
		c.configs.noWait,
		c.configs.args,
	); err != nil {
		return fmt.Errorf("messanger.Init: %w", err)
	}

	if err := c.channel.QueueBind(
		c.configs.queueName,
		c.configs.bindingKey,
		c.exchange.name,
		c.configs.noWait,
		c.configs.args,
	); err != nil {
		return fmt.Errorf("messanger.Init: %w", err)
	}

	return nil
}

func (c *consumer) StartConsuming(reloader ports.ConfigReloader) error {
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
		for range deliveries {
			reloader.ReloadConfiguration()
			//TODO check caso di errore
		}
	}()

	return nil
}
