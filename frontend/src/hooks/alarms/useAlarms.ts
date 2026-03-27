import { alarmsAPI } from "@/api/endpoints/alarms";
import { useQuery } from "@tanstack/react-query";
import type { Alarm } from "@/types";

export function useAlarms() {
  return useQuery<Alarm[]>({
    queryKey: ["alarms", "all"],
    queryFn: () => alarmsAPI.getAll(),
    refetchInterval: 60000, //? Polling (60 seconds)
    refetchIntervalInBackground: true, //? Polling in background
  });
}

export function useAlarm(alarmID: number) {
  return useQuery<Alarm>({
    queryKey: ["alarms", alarmID],
    queryFn: () => alarmsAPI.getByID(alarmID),
  });
}
