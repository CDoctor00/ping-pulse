import { settingsAPI } from "@/api/endpoints/settings";
import { useQuery } from "@tanstack/react-query";
import type { Configs } from "@/types";

export function useSettings() {
  return useQuery<Configs>({
    queryKey: ["settings"],
    queryFn: () => settingsAPI.getAll(),
  });
}
