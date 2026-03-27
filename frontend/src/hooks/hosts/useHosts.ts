import { useQuery } from "@tanstack/react-query";
import { hostsAPI } from "@/api/endpoints/hosts";
import type { Host } from "@/types";

export function useHosts() {
  return useQuery<Host[]>({
    queryKey: ["hosts", "all"],
    queryFn: () => hostsAPI.getAll(),
    refetchInterval: 60000, //? Polling (60 seconds)
    refetchIntervalInBackground: true, //? Polling in background
  });
}

export function useHost(hostID: number) {
  return useQuery<Host>({
    queryKey: ["hosts", hostID],
    queryFn: () => hostsAPI.getByID(hostID),
  });
}
