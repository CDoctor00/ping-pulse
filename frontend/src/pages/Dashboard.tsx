import { EmptyState, LoadingSpinner } from "@/components/common";
import {
  MostAlarmsChart,
  StatusOverviewCard,
  TopMetricsChart,
  useDashboardStats,
} from "@/features/dashboard";
import { PageHeader } from "@/layout";
import { AlertTriangle, LayoutDashboard, Server } from "lucide-react";

export function Dashboard() {
  const { isLoading, data: stats } = useDashboardStats();

  //* Loading state
  if (isLoading || !stats) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <PageHeader
          title="Dashboard"
          description="Panoramica dello stato della rete e delle metriche principali"
        />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  //* Data
  const {
    totalHosts,
    hostsByStatus,
    hostsPercentages,
    totalAlarms,
    alarmsByStatus,
    alarmsPercentages,
    avgLatency,
    avgPacketLoss,
    topLatencyHosts,
    topPacketLossHosts,
    hostAlarmCounts,
  } = stats;

  const hostStatusData = [
    {
      name: "UP",
      value: hostsByStatus.UP,
      percentage: hostsPercentages.UP,
      color: "hsl(var(--success))",
    },
    {
      name: "DOWN",
      value: hostsByStatus.DOWN,
      percentage: hostsPercentages.DOWN,
      color: "hsl(var(--error))",
    },
    {
      name: "PENDING",
      value: hostsByStatus.PENDING,
      percentage: hostsPercentages.PENDING,
      color: "hsl(var(--pending))",
    },
    {
      name: "UNREACHABLE",
      value: hostsByStatus.UNREACHABLE,
      percentage: hostsPercentages.UNREACHABLE,
      color: "hsl(var(--warning))",
    },
    {
      name: "MAINTENANCE",
      value: hostsByStatus.MAINTENANCE,
      percentage: hostsPercentages.MAINTENANCE,
      color: "hsl(var(--info))",
    },
  ];

  const alarmsStatusData = [
    {
      name: "PENDING",
      value: alarmsPercentages.PENDING,
      percentage: alarmsPercentages.PENDING,
      color: "hsl(var(--error))",
    },
    {
      name: "ACKNOWLEDGED",
      value: alarmsPercentages.ACKNOWLEDGED,
      percentage: alarmsPercentages.ACKNOWLEDGED,
      color: "hsl(var(--warning))",
    },
    {
      name: "RESOLVED",
      value: alarmsPercentages.RESOLVED,
      percentage: alarmsPercentages.RESOLVED,
      color: "hsl(var(--success))",
    },
  ];

  const networkHealthScore =
    totalHosts > 0 ? ((hostsByStatus.UP / totalHosts) * 100).toFixed(1) : "0.0";

  //* Empty State
  if (totalHosts === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Panoramica dello stato della rete e delle metriche principali"
        />
        <EmptyState
          icon={LayoutDashboard}
          title="Nessun dato disponibile"
          description="Aggiungi host per visualizzare le statistiche della dashboard"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Panoramica dello stato della rete e delle metriche principali"
      />

      {/* Host + Alarms Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatusOverviewCard
          title="Stato Host"
          icon={Server}
          total={totalHosts}
          data={hostStatusData}
          subtitle={`Network Health: ${networkHealthScore}%`}
        />
        <StatusOverviewCard
          title="Stato Allarmi"
          icon={AlertTriangle}
          total={totalAlarms}
          data={alarmsStatusData}
          subtitle={`Attivi: ${alarmsByStatus.PENDING + alarmsByStatus.ACKNOWLEDGED}`}
        />
      </div>

      {/* Top Charts */}
      <TopMetricsChart
        title="Top Host per Latenza"
        subtitle={`Media globale: ${avgLatency.toFixed(2)} ms`}
        hosts={topLatencyHosts}
        metric={{
          key: "averageLatency",
          label: "Latenza Media",
          unit: "ms",
        }}
        average={avgLatency}
        color="hsl(var(--primary))"
      />
      <TopMetricsChart
        title="Top Host con Packet Loss"
        subtitle={`Media globale: ${avgPacketLoss.toFixed(2)}%`}
        hosts={topPacketLossHosts}
        metric={{
          key: "averagePacketLoss",
          label: "Packet Loss Medio",
          unit: "%",
        }}
        average={avgPacketLoss}
        color="hsl(var(--primary))"
      />

      {/* Mini Cards + Most Alarms Chart */}
      <MostAlarmsChart data={hostAlarmCounts} />
    </div>
  );
}
