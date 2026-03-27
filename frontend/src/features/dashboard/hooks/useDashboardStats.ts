import { useCachedAlarms, useCachedHosts } from "@/hooks";
import { useMemo } from "react";

export function useDashboardStats() {
  const { data: hosts, isLoading: hostsLoading } = useCachedHosts();
  const { data: alarms, isLoading: alarmsLoading } = useCachedAlarms();

  const isLoading = hostsLoading || alarmsLoading;

  return useMemo(() => {
    if (!hosts || !alarms)
      return {
        isLoading,
        data: null,
      };

    //* Hosts Stats
    const totalHosts = hosts.length;

    const hostsByStatus = {
      UP: hosts.filter((h) => h.status === "UP").length,
      DOWN: hosts.filter((h) => h.status === "DOWN").length,
      PENDING: hosts.filter((h) => h.status === "PENDING").length,
      UNREACHABLE: hosts.filter((h) => h.status === "UNREACHABLE").length,
      MAINTENANCE: hosts.filter((h) => h.status === "MAINTENANCE").length,
    };
    const hostsPercentages = {
      UP:
        totalHosts > 0
          ? parseFloat(((hostsByStatus.UP / totalHosts) * 100).toFixed(2))
          : 0,
      DOWN:
        totalHosts > 0
          ? parseFloat(((hostsByStatus.DOWN / totalHosts) * 100).toFixed(2))
          : 0,
      PENDING:
        totalHosts > 0
          ? parseFloat(((hostsByStatus.PENDING / totalHosts) * 100).toFixed(2))
          : 0,
      UNREACHABLE:
        totalHosts > 0
          ? parseFloat(
              ((hostsByStatus.UNREACHABLE / totalHosts) * 100).toFixed(2),
            )
          : 0,
      MAINTENANCE:
        totalHosts > 0
          ? parseFloat(
              ((hostsByStatus.MAINTENANCE / totalHosts) * 100).toFixed(2),
            )
          : 0,
    };
    //* Alarms Stats
    const totalAlarms = alarms.length;

    const alarmsByStatus = {
      PENDING: alarms.filter((a) => a.status === "PENDING").length,
      ACKNOWLEDGED: alarms.filter((a) => a.status === "ACKNOWLEDGED").length,
      RESOLVED: alarms.filter((a) => a.status === "RESOLVED").length,
    };
    const alarmsPercentages = {
      PENDING:
        totalAlarms > 0
          ? parseFloat(
              ((alarmsByStatus.PENDING / totalAlarms) * 100).toFixed(2),
            )
          : 0,
      ACKNOWLEDGED:
        totalAlarms > 0
          ? parseFloat(
              ((alarmsByStatus.ACKNOWLEDGED / totalAlarms) * 100).toFixed(2),
            )
          : 0,
      RESOLVED:
        totalAlarms > 0
          ? parseFloat(
              ((alarmsByStatus.RESOLVED / totalAlarms) * 100).toFixed(2),
            )
          : 0,
    };

    //* Network Metrics
    const hostsWithLatency = hosts.filter((h) => h.averageLatency !== null);
    const avgLatency =
      hostsWithLatency.length > 0
        ? hostsWithLatency.reduce(
            (sum, h) => sum + (h.averageLatency || 0),
            0,
          ) / hostsWithLatency.length
        : 0;

    const hostsWithPacketLoss = hosts.filter(
      (h) => h.averagePacketLoss !== null,
    );
    const avgPacketLoss =
      hostsWithPacketLoss.length > 0
        ? hostsWithPacketLoss.reduce(
            (sum, h) => sum + (h.averagePacketLoss || 0),
            0,
          ) / hostsWithPacketLoss.length
        : 0;

    //* Top Hosts
    const topLatencyHosts = [...hosts]
      .filter((h) => h.averageLatency !== null)
      .sort((a, b) => (b.averageLatency || 0) - (a.averageLatency || 0));
    const topPacketLossHosts = [...hosts]
      .filter((h) => h.averagePacketLoss !== null)
      .sort((a, b) => (b.averagePacketLoss || 0) - (a.averagePacketLoss || 0));
    const hostAlarmCounts = hosts
      .map((host) => ({
        host,
        alarmCount: alarms.filter((a) => a.hostIP === host.ipAddress).length,
      }))
      .filter((item) => item.alarmCount > 0)
      .sort((a, b) => b.alarmCount - a.alarmCount);

    return {
      isLoading: false,
      data: {
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
      },
    };
  }, [hosts, alarms, isLoading]);
}
