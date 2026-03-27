export function formatErrorDetails(details: unknown): string | undefined {
  if (!details) return undefined;

  if (typeof details === "string") {
    return details;
  }

  if (typeof details === "object" && details !== null) {
    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  }

  return String(details);
}
