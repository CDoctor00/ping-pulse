# 🌍 Environment Variables Guide

This document provides a detailed overview of the environment variables required to configure and run the **Ping Pulse** microservices.

These variables allow for a clean separation between code and configuration, ensuring the system can be easily deployed across different environments (Development or Production).

## 📋 Table of Contents

- [System Configurations](https://www.google.com/search?q=%23system-configurations)
- [Infrastructure (DB & Broker)](https://www.google.com/search?q=%23infrastructure-db--broker)
- [Notifications (Telegram)](https://www.google.com/search?q=%23notifications-telegram)

## 🛠 System Configurations

These variables are used for general monitoring and sanity checks of the application state.

### `ENVIRONMENT`

- **Description**: Defines the runtime environment where the microservice is operating.
- **Possible Values**: `DEVELOPMENT` or `PRODUCTION`.
- **Notes**: Currently used as the primary flag to verify that environment variables are correctly imported. While not heavily used in logic yet, it is intended for debugging purposes and environment-specific behavior toggling.

### `VERSION`

- **Description**: Defines the current system version.
- **Example**: `1.0.0`, `v2.1-beta`.
- **Purpose**: Helps administrators and developers quickly verify if the running containers or services are up to date with the latest release.

## 🏗 Infrastructure (DB & Broker)

Essential variables that allow microservices to communicate with the persistence layer and the message broker.

### `DB_SOURCE`

- **Description**: The connection string (DSN) for the database.
- **Typical Format**: `postgresql://user:password@localhost:5432/dbname?sslmode=disable` (or similar depending on the DB engine).
- **Importance**: **Critical**. Without this variable, the backend services will fail to store or retrieve monitoring data.

### `RABBITMQ_URL`

- **Description**: The URL used to establish a connection with the RabbitMQ message broker.
- **Typical Format**: `amqp://guest:guest@localhost:5672/`
- **Purpose**: Manages asynchronous communication between services (e.g., sending heartbeat signals or alerts from the checker to the notifier).

## 📢 Notifications (Telegram)

Specific configurations for the _Notifier_ module, responsible for sending alerts to users.

### `TELEGRAM_BOT_API`

- **Description**: The unique API token provided by [@BotFather](https://www.google.com/search?q=https://t.me/botfather) when creating the bot.
- **Example**: `123456789:ABCDefGhIJKlmNoPQrsTUVwxyZ`.
- **Security**: This is a **secret key**. Never share it publicly or commit it to version control.

### `TELEGRAM_CHAT_IDS`

- **Description**: A vector (list) of unique chat identifiers where the Telegram bot will send notification messages.
- **Format**: A comma-separated string for multiple IDs.
- **Example**: `12345678,987654321`.

## 🚀 How to Configure

You can set these variables in two main ways:

1. **`.env` File**: Create a file named `.env` in the root directory of the project (or within specific microservice folders) following the specifications in the corrisponding `.env.example` file.
2. **Docker Compose**: If you are using Docker, map these variables directly in your `docker-compose.yml` file under the `environment:` section.
