import { apiFetch } from "../client";
import type { Host, NewHost } from "@/types";

const BASE_URL = "hosts";

export const hostsAPI = {
  getAll: () =>
    apiFetch<Host[]>(`${BASE_URL}/all`, {
      method: "GET",
    }),

  getByID: (id: number) =>
    apiFetch<Host>(`${BASE_URL}/${id}`, {
      method: "GET",
    }),

  add: (hosts: NewHost[]) =>
    apiFetch<void>(`${BASE_URL}/add`, {
      method: "POST",
      body: JSON.stringify({ hosts: hosts }),
    }),

  update: (hosts: Host[]) =>
    apiFetch<void>(`${BASE_URL}/update`, {
      method: "PUT",
      body: JSON.stringify({ hosts }),
    }),

  delete: (ids: number[]) =>
    apiFetch<void>(`${BASE_URL}/delete`, {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    }),

  switchMaintenance: (id: number, ipAddress: string, set: boolean) =>
    apiFetch<void>(`${BASE_URL}/switch-maintenance`, {
      method: "PATCH",
      body: JSON.stringify({
        hostID: id,
        hostIP: ipAddress,
        setMaintenance: set,
      }),
    }),
};
