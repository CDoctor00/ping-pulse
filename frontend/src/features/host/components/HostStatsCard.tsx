import { Card } from "@/components/ui";
import type { Host } from "@/types";
import { MetricItem } from "./MetricItem";
import { Activity, Network, TrendingDown, Wifi, WifiOff } from "lucide-react";

interface HostStatsCardProps {
  host: Host;
  childrenCount: number;
}

export function HostStatsCard({ host, childrenCount }: HostStatsCardProps) {
  return (
    <Card className="p-6">
      {/* Card Header */}
      <div className="mb-6 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Statistiche di Rete</h3>
      </div>

      {/* Statistics body */}
      <div className="grid grid-cols-1 gap-4">
        <MetricItem
          icon={Activity}
          label="Ping Totali"
          value={host.pingsCount.toLocaleString()}
          variant="default"
        />
        <MetricItem
          icon={Network}
          label="Host Figli"
          value={childrenCount}
          variant="default"
        />
        <MetricItem
          icon={WifiOff}
          label="Disconnessioni"
          value={host.disconnectionCount}
          variant={host.disconnectionCount === 0 ? "success" : "error"}
        />
        <MetricItem
          icon={Wifi}
          label="Latenza Media"
          value={
            host.averageLatency ? `${host.averageLatency.toFixed(2)} ms` : "N/A"
          }
          variant={
            !host.averageLatency
              ? "default"
              : host.averageLatency < 100
                ? "success"
                : host.averageLatency < 200
                  ? "pending"
                  : host.averageLatency < 300
                    ? "warning"
                    : "error"
          }
        />
        <MetricItem
          icon={TrendingDown}
          label="Perdita Pacchetti"
          value={
            host.averagePacketLoss
              ? `${host.averagePacketLoss.toFixed(2)} %`
              : "N/A"
          }
          variant={
            !host.averagePacketLoss
              ? "default"
              : host.averagePacketLoss < 1
                ? "success"
                : host.averagePacketLoss < 10
                  ? "pending"
                  : host.averagePacketLoss < 25
                    ? "warning"
                    : "error"
          }
        />
      </div>
    </Card>
  );
}
