# 🗄️ Database Documentation

This page documents the **PostgreSQL** database schema used by PingPulse to manage network topology, alarm states, and system configurations.

## 📌 Schema Overview

The database is organized within the `ping_pulse` schema. It utilizes referential integrity constraints (Foreign Keys) to ensure consistency between the host topology and alarm events.

### Enumerated Types (Enums)

The system uses custom types to ensure data consistency:

- `host_status`: `UP`, `DOWN`, `UNREACHABLE`.
- `alarm_status`: `PENDING`, `ACKNOWLEDGED`, `RESOLVED`.

## 📑 Tables

### 1. `hosts`

This is the central table defining the network topology. It manages the **Parent/Child** hierarchy required for the graph-based monitoring logic.

| Column                | Type           | Description                                                 |
| --------------------- | -------------- | ----------------------------------------------------------- |
| `id`                  | `INTEGER`      | Primary Key (Identity).                                     |
| `ip_address`          | `VARCHAR(20)`  | **Unique**. The host's IP address.                          |
| `name`                | `VARCHAR(255)` | **Unique**. Mnemonic name of the host.                      |
| `status`              | `host_status`  | Current operational status.                                 |
| `parent_ip`           | `VARCHAR(20)`  | FK to `hosts(ip_address)`. Defines hierarchical dependency. |
| `last_ping`           | `TIMESTAMPTZ`  | Timestamp of the last ping attempt.                         |
| `last_pulse`          | `TIMESTAMPTZ`  | Timestamp of the last state change (heartbeat).             |
| `pings_count`         | `INTEGER`      | Total number of pings executed.                             |
| `disconnection_count` | `INTEGER`      | Historical count of downtime events.                        |
| `avg_latency`         | `NUMERIC`      | Average latency (ms).                                       |
| `avg_packet_loss`     | `NUMERIC`      | Average packet loss percentage.                             |
| `note`                | `TEXT`         | Description or some notes about the host.                   |
| `added_at`            | `TIMESTAMPTZ`  | Timestamp of the moment it was added the host to the db.    |

**Technical Notes:**

- Indexes are present on `ip_address` and `parent_ip` to optimize graph scanning queries and joins.
- `ON DELETE SET NULL` on the `parent_ip` column ensures that removing a parent does not accidentally delete children, but instead "orphans" them in the hierarchy.

### 2. `alarms`

Records the history of incidents and the status of notifications managed by the _Notification Handler_.

| Column         | Type           | Description                                                                                |
| -------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `id`           | `INTEGER`      | Primary Key.                                                                               |
| `host_ip`      | `VARCHAR(20)`  | FK to `hosts(ip_address)`. The host that triggered the alarm.                              |
| `status`       | `alarm_status` | Status of the alarm (Pending, Ack, Resolved).                                              |
| `children_id`  | `INTEGER []`   | Status of the alarm (Pending, Ack, Resolved).                                              |
| `started_at`   | `TIMESTAMPTZ`  | Start of the downtime event.                                                               |
| `resolved_at`  | `TIMESTAMPTZ`  | End of the event.                                                                          |
| `message_info` | `JSONB`        | Object used to save the text body and info about the users to whom the messages were sent. |

**Important Note on JSON Structure:**

The `message_info` column must contain a specific JSON object consisting of **2 fields**. More precisely it is componed as:

- `body`: The text body of the message.
- `users`: A vector of an object that represent info about the users to whom the messages were sent. Every item is structured as:
  - `chatID`: The ID of the chat where the message is sent.
  - `sentTime`: The timestamp of the moment when the message is sent (format `2006-01-02T15:04:05Z07:00`).
  - `messageID`: The ID of the message sent by the bot.

### 3. `configs`

A singleton table for global system settings (e.g., ping intervals, timeouts, API credentials).

| Column       | Type        | Description                                              |
| ------------ | ----------- | -------------------------------------------------------- |
| `id`         | `INTEGER`   | Constrained to `1` (ensures a single configuration row). |
| `data`       | `JSONB`     | Structured configuration in JSON format.                 |
| `updated_at` | `TIMESTAMP` | Last modification timestamp.                             |

**Important Note on JSON Structure:**

The `data` column must contain a specific JSON object consisting of **7 variables**. These variables are detailed in the [CONFIGURATION.md](CONFIGURATION.md) file. Each variable follows a standard schema composed of three fields:

- `key`: The unique identifier for the setting.
- `value`: The actual value assigned to the setting.
- `description`: A brief explanation of the setting's purpose.

This structure ensures that the system remains flexible and that every configuration parameter is self-documenting directly within the database.

## 🛠️ Integrity and Performance

### Indexes

To ensure high performance during the **Monitoring Core** scanning cycles:

```sql
CREATE INDEX idx_hosts_ip_address ON ping_pulse.hosts(ip_address);
CREATE INDEX idx_hosts_parent_ip ON ping_pulse.hosts(parent_ip);
```
