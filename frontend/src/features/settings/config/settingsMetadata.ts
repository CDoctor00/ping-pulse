export interface SettingMetadata {
  label: string;
  description: string;
  min: number;
  max: number;
  default: number;
  unit: string;
  step: number;
  icon?: string;
}

export const SETTINGS_METADATA: Record<string, SettingMetadata> = {
  packetsCount: {
    label: "Numero Pacchetti",
    description:
      "Numero di pacchetti ICMP da inviare per ogni operazione di ping",
    min: 1,
    max: 10,
    default: 3,
    unit: "pacchetti",
    step: 1,
  },

  packetSize: {
    label: "Dimensione Pacchetto",
    description: "Dimensione in byte di ciascun pacchetto ICMP inviato",
    min: 32,
    max: 1472,
    default: 32,
    unit: "B",
    step: 32,
  },

  pingsInterval: {
    label: "Intervallo Ping",
    description: "Intervallo di tempo tra due operazioni di ping consecutive",
    min: 500,
    max: 60000,
    default: 5000,
    unit: "ms",
    step: 500,
  },

  pingsTimeout: {
    label: "Timeout Ping",
    description:
      "Tempo massimo di attesa per la risposta di un pacchetto prima di considerarlo disperso",
    min: 500,
    max: 60000,
    default: 1000,
    unit: "ms",
    step: 500,
  },

  routineDelay: {
    label: "Intervallo Routine",
    description:
      "Intervallo di tempo tra l'esecuzione di due routine consecutive di monitoraggio",
    min: 10,
    max: 86400,
    default: 60,
    unit: "s",
    step: 10,
  },

  pendingThreshold: {
    label: "Soglia Pending",
    description:
      "Tempo di attesa prima di cambiare lo stato di un host da 'PENDING' a 'DOWN'",
    min: 60,
    max: 3600,
    default: 300,
    unit: "s",
    step: 60,
  },

  notificationRepeatInterval: {
    label: "Intervallo Ripetizione Notifiche",
    description:
      "Tempo di attesa prima di ripetere l'invio di una notifica tramite bot Telegram",
    min: 60,
    max: 7200,
    default: 300,
    unit: "s",
    step: 60,
  },
};

export const SETTINGS_GROUPS = {
  ping: {
    title: "Configurazione Ping",
    description: "Parametri per le operazioni di ping ICMP",
    settings: ["packetsCount", "packetSize", "pingsInterval", "pingsTimeout"],
  },
  monitoring: {
    title: "Configurazione Monitoraggio",
    description: "Parametri per il sistema di monitoraggio continuo",
    settings: ["routineDelay", "pendingThreshold"],
  },
  notifications: {
    title: "Configurazione Notifiche",
    description: "Parametri per il sistema di notifiche Telegram",
    settings: ["notificationRepeatInterval"],
  },
} as const;
