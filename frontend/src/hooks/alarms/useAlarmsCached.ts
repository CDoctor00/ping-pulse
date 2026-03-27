import { useQuery } from "@tanstack/react-query";
import { alarmsAPI } from "@/api/endpoints/alarms";
import type { Alarm } from "@/types";

export function useCachedAlarms() {
  return useQuery<Alarm[]>({
    queryKey: ["alarms", "all"],
    queryFn: () => alarmsAPI.getAll(),
    enabled: false, // It doesn't fetch
    refetchInterval: false, // No timer
    staleTime: Infinity, // Always fresh data (cache only)
  });
}
