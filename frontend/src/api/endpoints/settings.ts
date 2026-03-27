import type { Configs } from "@/types";
import { apiFetch } from "../client";

const BASE_URL = "configs";

export const settingsAPI = {
  getAll: () =>
    apiFetch<Configs>(`${BASE_URL}/all`, {
      method: "GET",
    }),

  update: (configs: Configs) =>
    apiFetch<void>(`${BASE_URL}/update`, {
      method: "PUT",
      body: JSON.stringify({ configs: configs }),
    }),
};
