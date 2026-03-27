import { settingsAPI } from "@/api/endpoints/settings";
import { useQuery } from "@tanstack/react-query";
import type { Configs } from "@/types";

export function useCachedSettings() {
  return useQuery<Configs>({
    queryKey: ["settings"],
    queryFn: () => settingsAPI.getAll(),
    enabled: false, // It doesn't fetch
    refetchInterval: false, // No timer
    staleTime: Infinity, // Always fresh data (cache only)
  });
}
