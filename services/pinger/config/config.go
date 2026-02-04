package config

import (
	"fmt"
	"os"
	"pinger/internal/core/domain"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

const (
	EnvDev  string = "DEVELOPMENT"
	EnvProd string = "PRODUCTION"
)

func LoadSystem() (*domain.SystemConfig, error) {
	if _, err := os.Stat(".env"); err == nil {
		if err = godotenv.Load(); err != nil {
			return nil, fmt.Errorf("config.LoadSystem: %w", err)
		}
	}

	var config = new(domain.SystemConfig)
	if err := env.Parse(config); err != nil {
		return nil, fmt.Errorf("config.LoadSystem: %w", err)
	}

	return config, nil
}
