import { Card } from "@/components/ui";
import { Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { MetricItem } from "./MetricItem";

interface HostMetricCardProps {
  alarmsCausedCount: number;
  alarmsInvolvedCount: number;
  uptimePercentage: number;
  hasActiveAlarm: boolean;
}

export function HostMetricsCard({
  alarmsCausedCount,
  alarmsInvolvedCount,
  uptimePercentage,
  hasActiveAlarm,
}: HostMetricCardProps) {
  return (
    <Card className="p-6">
      {/* Card Header */}
      <div className="mb-6 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Metriche di Rete</h3>
      </div>

      {/* Metrics body */}
      <div className="grid grid-cols-1 gap-4">
        <MetricItem
          icon={AlertTriangle}
          label="Allarmi Totali"
          value={alarmsCausedCount + alarmsInvolvedCount}
          variant={
            alarmsCausedCount + alarmsInvolvedCount == 0 ? "success" : "error"
          }
        />
        <MetricItem
          icon={AlertTriangle}
          label="Allarmi Causati"
          value={alarmsCausedCount}
          variant="default"
        />
        <MetricItem
          icon={AlertTriangle}
          label="Allarmi Coinvolti"
          value={alarmsInvolvedCount}
          variant="default"
        />
        <MetricItem
          icon={AlertTriangle}
          label="Allarme Attivo"
          value={hasActiveAlarm ? "Si" : "No"}
          variant={hasActiveAlarm ? "error" : "success"}
        />
        <MetricItem
          icon={TrendingUp}
          label="Uptime"
          value={`${uptimePercentage.toFixed(2)}%`}
          variant={
            uptimePercentage > 99
              ? "success"
              : uptimePercentage > 95
                ? "pending"
                : uptimePercentage > 90
                  ? "warning"
                  : "error"
          }
        />
      </div>
    </Card>
  );
}
