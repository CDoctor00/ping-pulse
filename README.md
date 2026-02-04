# PingPulse

The **_Ping Pulse_** project is a **high-reliability** and **decentralized** network monitoring system, designed to track the operational status of hosts within a defined topology. The architecture is based on **asynchronous microservices** that use a **message broaker** to collaborate and ensure that the critical _ping_ process is never interrupted by secondary notification or configuration services.

---

## 🔑 Key Features

PingPulse focuses on the continuity of the _ping_ service, intelligent dependency management, and timely, tiered notification.

- **High Reliability and Asynchronous Decoupling**
  - The architecture based on **Asynchronous Microservices** and **RabbitMQ** ensures the **Monitoring Core** (the ping process) is not blocked by failures in the notification or API services.
  - A **Message Broker** guarantees _buffering_ and reliable delivery of critical events (alarm and configuration).
- **Intelligent Monitoring Logic (Graph Management)**
  - Implements **Graph Logic** for managing **parent/child** host dependencies.
  - If a **parent** host is unreachable, **child** hosts are automatically marked as "UNREACHABLE" without executing additional pings, speeding up root cause identification.
- **Secure and Atomic Configuration Management**
  - Topology changes are managed by the **Backend API Service** using a **blocking Mutex** and an **Atomic SQL Transaction** on PostgreSQL, preventing inconsistencies.
  - The **Monitoring Core** uses an **internal Lock** to temporarily suspend the ping cycle and safely reload the configuration from PostgreSQL.
- **Multi-Channel Escalation Notification System**
  - The **Notification Handler Service** manages alarms with a two-level process:
    - **Primary Notification:** Immediate alert sending via **Telegram Bot API**.
    - **Automatic Escalation:** If the alarm is not **acknowledged** by the user clicking on the specific message button, the message will be deleted and new one will be sent until the alarm is marked as received.
- **User Interface and Centralized Data History**
  - The **Frontend Dashboard (React)** offers a **Dashboard** with **network graph** visualization and an interface for viewing data and modifying configuration.
  - **PostgreSQL** serves as the central archive for the **network topology**, detailed **uptime/downtime history**, and alarm status.

---

## 🏗️ System Architecture (Technologies: Golang, PostgreSQL, RabbitMQ, React)

The system is composed of three independent Golang services that communicate via RabbitMQ, supported by a relational database and a user interface.

| **Component**                               | **Architectural Role**               | **Main Tasks**                                                                                                                                                              |
| :------------------------------------------ | :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monitoring Core Service (Pinger)**        | **Core Logic (Producer/Consumer)**   | - Executes concurrent **pings**.<br>- Implements the network **graph logic**.<br>- **Produces** alarm events for RabbitMQ.<br>- **Consumes** configuration reload messages. |
| **Backend API Service (Server)**            | **Interface and Control**            | - Exposes **REST APIs** for the Frontend.<br>- Manages configuration changes with a **blocking lock**.<br>- **Produces** configuration reload events for RabbitMQ.          |
| **Notification Handler Service (Notifier)** | **Alarm Logic (Consumer)**           | - **Consumes** alarm events from RabbitMQ.<br>- Sends the primary notification (**Telegram**).<br>- Manages the **escalation timer**.<br>- Triggers the call (**Twilio**).  |
| **Frontend Dashboard (React)**              | **User Interface**                   | - Provides the Dashboard.<br>- **Network graph** visualization.<br>- Interface for configuration modification and history viewing.                                          |
| **PostgreSQL**                              | **Relational Database**              | - Stores the **network topology** and configurations.<br>- Maintains **uptime/downtime history** and alarms.                                                                |
| **RabbitMQ**                                | **Message Broker**                   | - Ensures **asynchronous communication** and **decoupling** between the Go services.<br>- Buffers critical events (alarm/configuration).                                    |
| **Telegram**                                | **External Services (Notification)** | - Communication channels for **primary notification** (Telegram Bot API).                                                                                                   |
| **Docker Compose**                          | **Local Orchestration**              | - Manages and interconnects the entire microservices environment for local development and deployment.                                                                      |

---

## 💡 Operational Flow Details

### Flow 1: Alarm Detection and Escalation

1.  **Monitoring Core** detects a state change thanks to the graph/ping logic.
2.  The Core sends a JSON message (alarm event) to the RabbitMQ queue.
3.  **Notification Handler** consumes the event.
4.  It sends the **Primary Notification** via Telegram, marking the alarm as **PENDING** in PostgreSQL.
5.  If no acknowledgment is received (via Telegram) within a time limit, the service sends again the notification.

### Flow 2: Configuration Update

1.  The administrator modifies the configuration (settings or topology) via the **Frontend Dashboard**.
2.  The **Backend API Service** receives the REST request.
3.  It applies a **blocking Mutex** to serialize writes.
4.  It executes the configuration modification in PostgreSQL using an **Atomic SQL Transaction**.
5.  It releases the Mutex.
6.  It sends a "Configuration Reload" message to the dedicated RabbitMQ queue.
7.  **Monitoring Core** receives the message, applies its **internal Lock** to momentarily suspend pings, reloads the new topology from PostgreSQL, and immediately resumes the updated ping cycle.
