package messanger

import (
	"fmt"

	"github.com/streadway/amqp"
)

type exchangeConfig struct {
	name       string
	kind       string // "direct", "topic", "fanout", etc.
	durable    bool
	autoDelete bool
	internal   bool
	noWait     bool
	args       amqp.Table
}

type producer struct {
	channel    *amqp.Channel
	routingKey string
	exchange   exchangeConfig
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
		return fmt.Errorf("messanger.setup: %w", err)
	}

	return nil
}

func NewConfigProducer(conn *amqp.Connection) *producer {
	channel, _ := conn.Channel()

	return &producer{
		channel: channel,
		exchange: exchangeConfig{
			name:       "config_exchange",
			kind:       "direct",
			durable:    true,
			autoDelete: false,
			internal:   false,
			noWait:     false,
			args:       nil,
		},
		routingKey: "request",
	}
}
