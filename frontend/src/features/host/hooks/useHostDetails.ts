import { useCachedAlarms, useCachedHosts } from "@/hooks";
import type { Host } from "@/types";
import { useMemo } from "react";

interface UseHostDetailsParams {
  host: Host | null;
  enabled?: boolean;
}

export function useHostDetails({ host, enabled = true }: UseHostDetailsParams) {
  const { data: allHosts, error: hostsError } = useCachedHosts();
  const { data: allAlarms, error: alarmsError } = useCachedAlarms();

  const hostAlarms = useMemo(() => {
    if (!host || !allAlarms || !enabled) return [];
    return allAlarms.filter(
      (alarm) =>
        alarm.hostIP === host.ipAddress ||
        (alarm.childrenID && alarm.childrenID.includes(host.id)),
    );
  }, [host, allAlarms, enabled]);

  const childrenHosts = useMemo(() => {
    if (!host || !allHosts || !enabled) return [];

    return allHosts.filter((h) => h.parentIP === host.ipAddress);
  }, [host, allHosts, enabled]);

  const alarmsCausedCount = useMemo(() => {
    if (!host || hostAlarms.length == 0) return 0;
    return hostAlarms.filter((a) => a.hostIP === host.ipAddress).length;
  }, [host, hostAlarms]);

  const alarmsInvolvedCount = useMemo(() => {
    if (!host || hostAlarms.length == 0) return 0;
    return hostAlarms.filter(
      (a) => a.childrenID && a.childrenID.includes(host.id),
    ).length;
  }, [host, hostAlarms]);

  const hasActiveAlarm = useMemo(() => {
    return hostAlarms.some((a) => a.status !== "RESOLVED");
  }, [hostAlarms]);

  const uptimePercentage = useMemo(() => {
    if (!host || !enabled) return 100;
    if (hostAlarms.length === 0) return 100;

    const now = new Date();
    const added = new Date(host.addedAt);
    const totalMinutes = (now.getTime() - added.getTime()) / (1000 * 60);

    const downMinutes = hostAlarms.reduce((sum, alarm) => {
      const start = new Date(alarm.startedAt);
      const end = alarm.resolvedAt ? new Date(alarm.resolvedAt) : now;
      return sum + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0);

    return Math.max(0, ((totalMinutes - downMinutes) / totalMinutes) * 100);
  }, [host, hostAlarms, enabled]);

  const isLoading = !allHosts || !allAlarms;
  const error = hostsError || alarmsError;

  return {
    hostAlarms,
    childrenHosts,
    alarmsCausedCount,
    alarmsInvolvedCount,
    hasActiveAlarm,
    uptimePercentage,
    isLoading,
    error,
  };
}
