export type AlarmStatus = "PENDING" | "ACKNOWLEDGED" | "RESOLVED";

export interface UserInfo {
  messageID: number;
  chatID: number;
  sentTime: string; //? datetime=2006-01-02T15:04:05Z07:00
  ackTime: string | null; //? datetime=2006-01-02T15:04:05Z07:00
}

export interface MessageInfo {
  body: string;
  users: UserInfo[];
}

export interface Alarm {
  id: number;
  hostIP: string;
  status: AlarmStatus;
  childrenID: number[];
  startedAt: string; //? datetime=2006-01-02T15:04:05Z07:00
  resolvedAt: string | null; //? datetime=2006-01-02T15:04:05Z07:00
  messageInfo: MessageInfo;
}
