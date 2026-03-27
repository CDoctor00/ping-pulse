export type HostStatus =
  | "DOWN"
  | "UNREACHABLE"
  | "PENDING"
  | "MAINTENANCE"
  | "UP";

export interface Host {
  id: number;
  name: string;
  ipAddress: string;
  status: HostStatus;
  addedAt: string;
  lastPing: string | null;
  lastPulse: string | null;
  parentIP: string | null;
  note: string | null;
  pingsCount: number;
  disconnectionCount: number;
  averageLatency: number | null;
  averagePacketLoss: number | null;
}

export interface NewHost {
  name: string;
  ipAddress: string;
  parentIP?: string | null;
  note?: string | null;
}
