INSERT INTO ping_pulse.configs (id, data, updated_at)
VALUES (1, '{
  "packetSize": {
    "name": "Dimensione Pacchetto",
    "value": 64,
    "description": "Dimensione in byte di ciascun pacchetto ICMP inviato"
  },
  "packetsCount": {
    "name": "Numero pacchetti",
    "value": 3,
    "description": "Numero di pacchetti ICMP da inviare per ogni operazione di ping"
  },
  "pingsTimeout": {
    "name": "Timeout Ping",
    "value": 1000,
    "description": "Tempo massimo di attesa per la risposta di un pacchetto prima di considerarlo disperso"
  },
  "routineDelay": {
    "name": "Intervallo Routine",
    "value": 60,
    "description": "Intervallo di tempo tra l''esecuzione di due routine consecutive di monitoraggio"
  },
  "pingsInterval": {
    "name": "Intervallo Ping",
    "value": 500,
    "description": "Intervallo di tempo tra due operazioni di ping consecutive"
  },
  "pendingThreshold": {
    "name": "Soglia Pending",
    "value": 300,
    "description": "Tempo di attesa prima di cambiare lo stato di un host da ''PENDING'' a ''DOWN''"
  },
  "notificationRepeatInterval": {
    "name": "Intervallo Ripetizione Notifiche",
    "value": 300,
    "description": "Tempo di attesa prima di ripetere l''invio di una notifica tramite bot Telegram"
  }
}', NOW());