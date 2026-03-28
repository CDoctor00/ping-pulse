# 🌍 Environment Variables Guide

This document provides a detailed overview of the environment variables required to configure and run the **Ping Pulse** microservices.

These variables allow for a clean separation between code and configuration, ensuring the system can be easily deployed across different environments (Development or Production).

## 📋 Table of Contents

- [System Configurations](#system-configurations)
- [Infrastructure (DB & Broker)](#infrastructure-db--broker)
- [Notifications (Telegram)](#notifications-telegram)
- [Frontend](#frontend)
- [Per-Service Reference](#per-service-reference)
- [How to Configure](#how-to-configure)

---

## 🛠 System Configurations

These variables are used for general monitoring and sanity checks of the application state.

**Used by**: `pinger`, `server`, `notifier`

### `ENVIRONMENT`

- **Description**: Defines the runtime environment where the microservice is operating.
- **Possible Values**: `DEVELOPMENT` or `PRODUCTION`.
- **Notes**: Currently used as the primary flag to verify that environment variables are correctly imported. While not heavily used in logic yet, it is intended for debugging purposes and environment-specific behavior toggling.

### `VERSION`

- **Description**: Defines the current system version.
- **Example**: `1.0.0`, `v2.1-beta`.
- **Purpose**: Helps administrators and developers quickly verify if the running containers or services are up to date with the latest release.

---

## 🏗 Infrastructure (DB & Broker)

Essential variables that allow microservices to communicate with the persistence layer and the message broker.

### `DB_SOURCE`

- **Description**: The full connection string (DSN) for the PostgreSQL database.
- **Format**: `postgresql://user:password@host:5432/dbname?sslmode=disable&application_name=service_name`
- **Used by**: `migrator`, `pinger`, `server`, `notifier`
- **Importance**: **Critical**. Without this variable, services will fail to store or retrieve monitoring data.
- **Notes**: When running inside Docker Compose, the host must be `database` (the service name), not `localhost`.

### `RABBITMQ_URL`

- **Description**: The URL used to establish a connection with the RabbitMQ message broker.
- **Format**: `amqp://user:password@host:5672/`
- **Used by**: `pinger`, `server`, `notifier`
- **Notes**: When running inside Docker Compose, the host must be `rabbitmq` (the service name), not `localhost`.

### `DB_USER`, `DB_PASSWORD`, `DB_NAME`

- **Description**: Credentials and database name used by the root `.env` to initialize the PostgreSQL container and the `db-maintenance` service.
- **Used by**: root `.env` (mapped to `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` by Docker Compose for the database container, and used directly by the `db-maintenance` scripts).

---

## 📢 Notifications (Telegram)

Specific configurations for the `notifier` service, responsible for sending alerts to users.

**Used by**: `notifier`

### `TELEGRAM_BOT_API`

- **Description**: The unique API token provided by [@BotFather](https://t.me/botfather) when creating the bot.
- **Example**: `123456789:ABCDefGhIJKlmNoPQrsTUVwxyZ`.
- **Security**: This is a **secret key**. Never share it publicly or commit it to version control.

### `TELEGRAM_CHAT_IDS`

- **Description**: A list of unique chat identifiers where the Telegram bot will send notification messages.
- **Format**: Comma-separated string for multiple IDs.
- **Example**: `12345678,987654321`.

---

## 🖥 Frontend

### `VITE_API_BASE_URL`

- **Description**: The base URL of the Backend API Service, used by the React frontend to make HTTP requests.
- **Used by**: `frontend`
- **Example**: `http://localhost:7000`
- **Notes**: This variable is resolved by the **user's browser**, not by Docker. Therefore it must point to the host-exposed port of the `server` service, not to the Docker service name.

---

## 📦 Per-Service Reference

A quick reference of which variables are required for each service. Each service has a corresponding `.env.example` file that can be used as a starting point.

### Root `.env`

```env
DB_USER=pingpulse_user
DB_PASSWORD=pingpulse_password
DB_NAME=pingpulse_db
```

### `migrator/.env`

```env
DB_SOURCE=postgresql://pingpulse_user:pingpulse_password@database:5432/pingpulse_db?sslmode=disable&application_name=migrator
```

### `services/pinger/.env`

```env
ENVIRONMENT=DEVELOPMENT
VERSION=1.0.0
DB_SOURCE=postgresql://pingpulse_user:pingpulse_password@database:5432/pingpulse_db?sslmode=disable&application_name=pinger
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
```

### `services/server/.env`

```env
ENVIRONMENT=DEVELOPMENT
VERSION=1.0.0
DB_SOURCE=postgresql://pingpulse_user:pingpulse_password@database:5432/pingpulse_db?sslmode=disable&application_name=server
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
```

### `services/notifier/.env`

```env
ENVIRONMENT=DEVELOPMENT
VERSION=1.0.0
DB_SOURCE=postgresql://pingpulse_user:pingpulse_password@database:5432/pingpulse_db?sslmode=disable&application_name=notifier
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
TELEGRAM_BOT_API=your_bot_token
TELEGRAM_CHAT_IDS=your_chat_id
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:7000
```

---

## 🚀 How to Configure

Each service has a corresponding `.env.example` file in its directory that lists all required variables with placeholder values. To configure a service:

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Fill in the values according to your environment.

Variables can also be overridden directly in `docker-compose.yml` under the `environment:` section of each service, which takes precedence over the `.env` file.

> **Security reminder**: Never commit `.env` files to version control. Make sure `.env` is listed in your `.gitignore`.
