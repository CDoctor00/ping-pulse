import { APIError, type APIErrorResponse } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiOptions extends RequestInit {
  timeout?: number;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { timeout = 5000, method = "GET", headers, ...customConfig } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...customConfig,
    signal: controller.signal,
  };

  try {
    const response = await fetch(`${BASE_URL}/api/${endpoint}`, config);
    clearTimeout(timer);

    if (!response.ok) {
      let errorBody: APIErrorResponse | null = null;

      try {
        errorBody = await response.json();
      } catch {
        errorBody = null;
      }

      const errorMessage =
        errorBody?.error || `Errore ${response.status}: ${response.statusText}`;
      const errorDetails = errorBody?.details;

      throw new APIError(errorMessage, response.status, errorDetails);
    }

    if (response.status === 204) return {} as T;

    return await response.json();
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new APIError("Timeout: Il server non ha risposto in tempo", 408);
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new APIError(
        "Errore di connesione - Verifica la connessione al server",
      );
    }

    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(error.message || "Errore sconiscuto");
  }
}
