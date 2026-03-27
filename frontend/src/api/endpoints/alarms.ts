import type { Alarm } from "@/types";
import { apiFetch } from "../client";

const BASE_URL = "alarms";

export const alarmsAPI = {
  getAll: () =>
    apiFetch<Alarm[]>(`${BASE_URL}/all`, {
      method: "GET",
    }),

  getByID: (id: number) =>
    apiFetch<Alarm>(`${BASE_URL}/${id}`, {
      method: "GET",
    }),

  delete: (ids: number[]) =>
    apiFetch<void>(`${BASE_URL}/delete`, {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    }),
};
