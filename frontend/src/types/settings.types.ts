export interface Config {
  name: string;
  value: number;
  description: string;
}

export interface Configs {
  packetsCount: Config;
  packetSize: Config;
  pingsInterval: Config;
  pingsTimeout: Config;
  routineDelay: Config;
  pendingThreshold: Config;
  notificationRepeatInterval: Config;
}
