import type { AlarmStatus, HostStatus } from "@/types";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: HostStatus | AlarmStatus;
  className?: string;
}

const statusConfig = {
  // Host statuses
  UP: {
    label: "UP",
    className: "bg-success text-white border-success",
  },
  DOWN: {
    label: "DOWN",
    className: "bg-error text-white border-error",
  },
  UNREACHABLE: {
    label: "UNREACHABLE",
    className: "bg-warning text-warning-foreground border-warning",
  },
  MAINTENANCE: {
    label: "MAINTENANCE",
    className: "bg-info text-info-foreground border-info",
  },

  // Alarm status
  PENDING: {
    label: "PENDING",
    className: "bg-pending text-pending-foreground border-pending",
  },
  ACKNOWLEDGED: {
    label: "ACKNOWLEDGED",
    className: "bg-info text-white border-info",
  },
  RESOLVED: {
    label: "RESOLVED",
    className: "bg-success text-white border-success",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
