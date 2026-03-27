import { cn } from "@/lib/utils";
import type { Host } from "@/types";
import {
  CircleAlert,
  CircleCheck,
  ClockArrowDown,
  Cog,
  Computer,
  XCircle,
} from "lucide-react";
import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

interface HostNodeData {
  host: Host;
  onClick?: (host: Host) => void;
  isFiltered?: boolean;
}

function HostNode({ data, selected }: NodeProps<HostNodeData>) {
  const { host, onClick, isFiltered } = data;

  // const Icon = host.name.toLowerCase().includes("db")
  //   ? Database
  //   : host.name.toLowerCase().includes("api")
  //     ? Server
  //     : host.name.toLowerCase().includes("gateway")
  //       ? Globe
  //       : host.name.toLowerCase().includes("router")
  //         ? Wifi
  //         : HardDrive;

  const Icon = Computer;

  const StatusIcon = (() => {
    switch (host.status) {
      case "UP":
        return CircleCheck;
      case "PENDING":
        return ClockArrowDown;
      case "UNREACHABLE":
        return CircleAlert;
      case "DOWN":
        return XCircle;
      case "MAINTENANCE":
        return Cog;
    }
  })();

  const statusColors = {
    UP: {
      border: "border-success",
      bg: "bg-success/10",
      icon: "text-success",
      glow: "shadow-success/20",
    },
    PENDING: {
      border: "border-pending",
      bg: "bg-pending/10",
      icon: "text-pending",
      glow: "shadow-pending/20",
    },
    UNREACHABLE: {
      border: "border-warning",
      bg: "bg-warning/10",
      icon: "text-warning",
      glow: "shadow-warning/20",
    },
    DOWN: {
      border: "border-error",
      bg: "bg-error/10",
      icon: "text-error",
      glow: "shadow-error/20",
    },
    MAINTENANCE: {
      border: "border-info-foreground",
      bg: "bg-info",
      icon: "text-info-foreground",
      glow: "shadow-info/20",
    },
  };

  const colors = statusColors[host.status];

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 bg-card shadow-lg transition-all duration-200",
        "hover:shadow-xl hover:scale-105",
        colors.border,
        colors.glow,
        selected && "ring-2 ring-secondary ring-offset-background scale-105",
        !isFiltered && "opacity-30 grayscale",
      )}
      style={{ width: 200, minHeight: 100 }}
      onClick={() => onClick?.(host)}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="bg-muted-foregroun! w-2! h-2!"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-muted-foregroun! w-2! h-2!"
      />

      {/* Header */}
      <div
        className={cn("flex items-center gap-2 px-3 py-2 border-b", colors.bg)}
      >
        <div
          className={cn("p-1,5 rounded-md bg-card", colors.border, "border")}
        >
          <Icon className={cn("h-4 w-4", colors.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">
            {host.name}
          </div>
        </div>
        <StatusIcon className={cn("h-4 w-4", colors.icon)} />
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        {/* IP Address */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Indirizzo IP: </span>
          <code className="font-mono text-foreground">{host.ipAddress}</code>
        </div>
        {/* Latency */}
        {host.averageLatency !== null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Latenza media: </span>
            <span
              className={cn(
                "font-medium",
                host.averageLatency < 100
                  ? "text-success"
                  : host.averageLatency < 200
                    ? "text-pending"
                    : host.averageLatency < 300
                      ? "text-warning"
                      : "text-error",
              )}
            >
              {host.averageLatency.toFixed(2)} ms
            </span>
          </div>
        )}

        {/* Packet Loss */}
        {host.averagePacketLoss !== null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Latenza media: </span>
            <span
              className={cn(
                "font-medium",
                host.averagePacketLoss < 1
                  ? "text-success"
                  : host.averagePacketLoss < 10
                    ? "text-pending"
                    : host.averagePacketLoss < 25
                      ? "text-warning"
                      : "text-error",
              )}
            >
              {host.averagePacketLoss.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Status Pulse Animation */}
      {host.status === "UP" && isFiltered && (
        <div className="absolute -top-1 -right-1">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
          </span>
        </div>
      )}
    </div>
  );
}

export default memo(HostNode);
