package messanger

import (
	"fmt"
	"pinger/internal/core/ports"

	"github.com/streadway/amqp"
)

var _ ports.AlarmProducer = (*producer)(nil)

func (p *producer) Init() error {
	if err := p.exchange.setup(p.channel); err != nil {
		return fmt.Errorf("messanger.Init: %w", err)
	}

	return nil
}

func (p *producer) PublishEvent(body []byte) error {
	if err := p.channel.Publish(
		p.exchange.name,
		p.routingKey,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent,
		},
	); err != nil {
		return fmt.Errorf("messanger.PublishEvent: %w", err)
	}

	return nil
}
