package repository

import (
	"server/internal/core/ports/outbound"

	"github.com/jmoiron/sqlx"
)

type PostgresAdapter struct {
	db *sqlx.DB
}

var _ outbound.DataRepository = (*PostgresAdapter)(nil)

func NewPostgresAdapter(clientDB *sqlx.DB) *PostgresAdapter {
	return &PostgresAdapter{db: clientDB}
}
