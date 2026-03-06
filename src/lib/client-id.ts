const CLIENT_ID_KEY = "pulseforge_client_id";

/** Returns a stable per-browser client id used for server-side rate limiting. */
export function getOrCreateClientId(): string {
  const existing = window.localStorage.getItem(CLIENT_ID_KEY);

  if (existing) {
    return existing;
  }

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

  window.localStorage.setItem(CLIENT_ID_KEY, generated);
  return generated;
}
