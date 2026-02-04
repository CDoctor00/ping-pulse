package messanger

import (
	"fmt"

	"github.com/streadway/amqp"
)

type consumer struct {
	channel  *amqp.Channel
	configs  consumerConfig
	exchange exchangeConfig
}

type exchangeConfig struct {
	name       string
	kind       string // "direct", "topic", "fanout", etc.
	durable    bool
	autoDelete bool
	internal   bool
	noWait     bool
	args       amqp.Table
}

type consumerConfig struct {
	queueName  string
	bindingKey string
	durable    bool
	autoDelete bool
	exclusive  bool
	noWait     bool
	args       amqp.Table
}

func (e *exchangeConfig) setup(channel *amqp.Channel) error {
	if err := channel.ExchangeDeclare(
		e.name,
		e.kind,
		e.durable,
		e.autoDelete,
		e.internal,
		e.noWait,
		e.args,
	); err != nil {
		return fmt.Errorf("messanger.Setup: %w", err)
	}

	return nil
}

func NewConsumerNetwork(conn *amqp.Connection) *consumer {
	channel, _ := conn.Channel()

	return &consumer{
		channel: channel,
		exchange: exchangeConfig{
			name:       "network_exchange",
			kind:       "direct",
			durable:    true,
			autoDelete: false,
			internal:   false,
			noWait:     false,
			args:       nil,
		},
		configs: consumerConfig{
			queueName:  "network_queue",
			bindingKey: "alarm",
			durable:    true,
			autoDelete: false,
			exclusive:  false,
			noWait:     false,
			args:       nil,
		},
	}
}
