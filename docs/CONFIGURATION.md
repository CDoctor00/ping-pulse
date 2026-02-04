# ⚙️ Business Logic Configuration

This document outlines the dynamic configuration parameters stored in the database in the `data` column of the `configs` table as a JSON object. Unlike environment variables, these settings control the core behavior of the ping engine and notification logic at runtime.

## 📡 Network & Ping Settings

These parameters define how the system interacts with the monitored hosts.

| Parameter          | Unit  | Description                                                           |
| ------------------ | ----- | --------------------------------------------------------------------- |
| **Packet Size**    | Bytes | The size of each ICMP packet sent to the hosts.                       |
| **Packets Count**  | Count | Number of packets sent during each routine for every single host.     |
| **Pings Timeout**  | ms    | Maximum time to wait for a response before considering a packet lost. |
| **Pings Interval** | ms    | The delay between sending one packet and the next to the same host.   |

## ⏱️ Routine & Timing

Settings that control the frequency and thresholds of the monitoring cycles.

| Parameter             | Unit    | Description                                                                                     |
| --------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| **Routine Delay**     | Seconds | The idle time between the completion of one scan routine and the start of the next.             |
| **Pending Threshold** | Seconds | The grace period allowed before an unresponsive host's status changes from `PENDING` to `DOWN`. |

## 🔔 Notification Logic

Settings that govern how and when the system alerts the users.

| Parameter                        | Unit    | Description                                                                                  |
| -------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| **Notification Repeat Interval** | Seconds | The cooldown period before the Telegram bot sends a repeated alert for the same host status. |
