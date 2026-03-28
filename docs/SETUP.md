# 🚀 Setup & Deployment Guide

This document describes how to configure, build, and run the entire PingPulse stack locally using Docker Compose.

---

## 📋 Prerequisites

Make sure the following tools are installed on your machine before proceeding:

- [Docker](https://docs.docker.com/get-docker/) (with Docker Compose v2)
  - **Linux**: Install Docker Engine and the Compose plugin following the [official guide](https://docs.docker.com/engine/install/).
  - **Windows / macOS**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), which includes both Docker Engine and Compose.
- [Git](https://git-scm.com/) _(optional — only needed if cloning via terminal)_

> **Windows users**: All commands in this guide use standard Docker CLI syntax and are fully compatible with **PowerShell** or **Command Prompt** on Windows. The only exception is the `$(pwd)` syntax used in some `docker run` commands, which must be replaced with `%cd%` in Command Prompt or `${PWD}` in PowerShell.

---

## 📥 Installation

### Option A — Clone via Git (terminal)

```bash
git clone https://github.com/your-username/ping-pulse.git
cd ping-pulse
```

### Option B — Download as ZIP (no Git required)

1. Go to the repository page on GitHub.
2. Click **Code → Download ZIP**.
3. Extract the archive to your preferred location.
4. Open a terminal and navigate to the extracted folder:

```bash
# Linux / macOS
cd path/to/ping-pulse

# Windows (PowerShell)
cd path\to\ping-pulse
```

### Configure environment variables

Before starting the stack, configure the `.env` files for each service. Refer to the [ENVIRONMENT.md](ENVIRONMENT.md) guide for the full list of required variables.

Each service provides a `.env.example` file as a starting point:

```bash
# Linux / macOS
cp .env.example .env
cp migrator/.env.example migrator/.env
cp services/pinger/.env.example services/pinger/.env
cp services/server/.env.example services/server/.env
cp services/notifier/.env.example services/notifier/.env
cp frontend/.env.example frontend/.env
```

```powershell
# Windows (PowerShell)
Copy-Item .env.example .env
Copy-Item migrator\.env.example migrator\.env
Copy-Item services\pinger\.env.example services\pinger\.env
Copy-Item services\server\.env.example services\server\.env
Copy-Item services\notifier\.env.example services\notifier\.env
Copy-Item frontend\.env.example frontend\.env
```

Fill in the values in each `.env` file before proceeding.

---

## 📁 Project Structure

```
ping-pulse/
├── backups/                  # Bind mount for DB dumps and logs (auto-created)
│   ├── dumps/                # Compressed SQL backup files
│   └── logs/                 # Backup, restore, validation and cron logs
├── db-maintenance/           # Database backup/restore/validation container
│   ├── backup.sh
│   ├── restore.sh
│   ├── validate.sh
│   ├── tui.sh
│   ├── crontab
│   └── Dockerfile
├── frontend/                 # React + Vite frontend
│   ├── src/
│   ├── .env
│   ├── .env.example
│   └── Dockerfile
├── migrator/                 # Database migration container
│   ├── migrations/
│   ├── entrypoint.sh
│   ├── .env
│   └── Dockerfile
├── services/
│   ├── pinger/               # Monitoring Core microservice (Go)
│   │   ├── cmd/
│   │   ├── internal/
│   │   ├── .env
│   │   └── Dockerfile
│   ├── server/               # Backend API microservice (Go)
│   │   ├── cmd/
│   │   ├── internal/
│   │   ├── .env
│   │   └── Dockerfile
│   └── notifier/             # Notification Handler microservice (Go)
│       ├── cmd/
│       ├── internal/
│       ├── .env
│       └── Dockerfile
├── .env                      # Root environment variables
└── docker-compose.yml
```

---

## 🌐 Exposed Ports

| Service    | Host Port | Container Port | Description             |
| :--------- | :-------- | :------------- | :---------------------- |
| RabbitMQ   | `10000`   | `5672`         | AMQP connection         |
| RabbitMQ   | `10001`   | `15672`        | Management UI           |
| PostgreSQL | `10002`   | `5432`         | Database connection     |
| Server     | `7000`    | `7000`         | Backend REST API        |
| Frontend   | `4173`    | `4173`         | Vite preview (React UI) |

---

## 🐳 Running the Stack

### 1. Validate the Compose configuration

Before starting anything, verify the compose file has no syntax or configuration errors:

```bash
docker compose config
```

### 2. Start infrastructure services

```bash
docker compose up -d rabbitmq database
```

Wait for the database to become healthy:

```bash
docker compose ps
# database should show "healthy"
```

### 3. Run database migrations

```bash
docker compose up --build migrator
```

Verify it exits successfully:

```bash
docker compose ps migrator
# Should show "exited (0)"
```

### 4. Start the database maintenance container

```bash
docker compose up -d db-maintenance
```

Verify it is running:

```bash
docker compose ps db-maintenance
docker compose logs db-maintenance
```

### 5. Start the microservices

```bash
docker compose up -d pinger server notifier
```

Check logs for each service:

```bash
docker compose logs -f pinger
docker compose logs -f server
docker compose logs -f notifier
```

### 6. Start the frontend

```bash
docker compose up -d frontend
```

The UI will be available at [http://localhost:4173](http://localhost:4173).

---

### Start the entire stack at once

Once you have verified each service individually, you can start everything with a single command:

```bash
docker compose up -d
```

To force a rebuild of all images:

```bash
docker compose up -d --build
```

---

## 🛑 Stopping the Stack

Stop all services without removing containers:

```bash
docker compose stop
```

Stop and remove containers, networks, and volumes:

```bash
docker compose down
```

To also remove named volumes (deletes database data):

```bash
docker compose down -v
```

---

## 🔧 Useful Commands

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f server
```

### Rebuild a single service

```bash
docker compose up -d --build server
```

### Access the database maintenance TUI

```bash
docker exec -it pingpulse_db_maintenance /usr/local/bin/tui.sh
```

### Access the database directly

```bash
docker exec -it pingpulse_db psql -U your_user -d your_db
```

### Access the RabbitMQ Management UI

Open [http://localhost:10001](http://localhost:10001) in your browser.

---

## 🔄 Re-running Migrations

If you need to re-run migrations (e.g., after adding new migration files):

```bash
docker compose up --build migrator
```

> **Note**: The migrator runs `migrate up`, which only applies pending migrations. Already applied migrations are skipped.
