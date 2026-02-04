package repository

import (
	"fmt"
	"sync"

	"github.com/jmoiron/sqlx"

	_ "github.com/lib/pq"
)

var (
	instance *sqlx.DB
	once     sync.Once
)

func OpenConnection(connectionURL string) error {
	if connectionURL == "" {
		return fmt.Errorf("client.OpenConnection: Database connection URL is empty")
	}

	var err error

	once.Do(func() {
		instance, err = sqlx.Connect("postgres", connectionURL)
	})
	if err != nil {
		return fmt.Errorf("client.OpenConnection: %w", err)
	}

	err = instance.Ping()
	if err != nil {
		return fmt.Errorf("client.OpenConnection: %w", err)
	}

	instance.SetMaxOpenConns(25)
	instance.SetMaxIdleConns(10)

	return nil
}

func CloseConnection() error {
	if err := instance.Close(); err != nil {
		return fmt.Errorf("client.CloseConnection: %w", err)
	}

	return nil
}

func GetInstance() *sqlx.DB {
	return instance
}
