package database

import (
	"database/sql"
	"fmt"
	"sync"

	_ "github.com/mattn/go-sqlite3" //PostgreSQL driver
)

var (
	instance *sql.DB
	once     sync.Once
)

type Model struct {
	DB *sql.DB
	Tx *sql.Tx
}

func OpenConnection() error {
	var err error

	once.Do(func() {
		db, errConnection := sql.Open("sqlite3", "./database/pingpulse.db")
		if errConnection != nil {
			err = errConnection
		}

		instance = db
	})
	if err != nil {
		return fmt.Errorf("connection.Open: %w", err)
	}

	err = instance.Ping()
	if err != nil {
		return fmt.Errorf("connection.Open: %w", err)
	}

	return nil
}

func CloseConnection() error {
	err := instance.Close()

	if err != nil {
		return nil
	}
	return fmt.Errorf("connection.Close: %w", err)
}

func (model *Model) GetInstance() {
	*model = Model{
		DB: instance,
	}
}

func (model *Model) StartTransaction() error {
	tx, errTx := model.DB.Begin()
	if errTx != nil {
		return fmt.Errorf("database.Connect: %w", errTx)
	}

	*model = Model{
		DB: instance,
		Tx: tx,
	}

	return nil
}

func (model *Model) CommitTransaction() error {
	err := model.Tx.Commit()
	if err != nil {
		return fmt.Errorf("database.CommitTransaction: %w", err)
	}

	return nil
}

func (model *Model) CancelTransaction() error {
	err := model.Tx.Rollback()
	if err != nil {
		return fmt.Errorf("database.CancelTransaction: %w", err)
	}

	return nil
}
