import { useQuery } from "@tanstack/react-query";
import { hostsAPI } from "@/api/endpoints/hosts";
import type { Host } from "@/types";
import { useMemo } from "react";

export function useCachedHosts() {
  return useQuery<Host[]>({
    queryKey: ["hosts", "all"],
    queryFn: () => hostsAPI.getAll(),
    enabled: false, // It doesn't fetch
    refetchInterval: false, // No timer
    staleTime: Infinity, // Always fresh data (cache only)
  });
}

export function useCachedHost(hostID: number) {
  const { data: hosts, isLoading, error } = useCachedHosts();

  const host = useMemo(() => {
    if (!hosts) return null;
    return hosts.find((h) => h.id === hostID) || null;
  }, [hosts, hostID]);

  return {
    host,
    isLoading,
    error,
  };
}
