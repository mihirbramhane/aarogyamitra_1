// lib/backendFetch.ts
// Shared helper for the /api/* route handlers that proxy to the FastAPI
// backend: applies a request timeout (a bare `fetch` never times out on its
// own) and produces one clear, actionable message for "unreachable" vs
// "timed out" instead of every failure collapsing into an opaque 502.

const BACKEND_URL = process.env.AGENT_BACKEND_URL ?? "http://localhost:8000";
const DEFAULT_TIMEOUT_MS = 20_000;

export async function fetchBackend(
  path: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${BACKEND_URL}${path}`, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function backendUnreachableMessage(err: unknown): string {
  if (err instanceof Error && err.name === "AbortError") {
    return `The agent backend at ${BACKEND_URL} did not respond in time. It may be slow, stuck, or overloaded.`;
  }
  return `Could not reach the agent backend at ${BACKEND_URL}. Is it running? (cd backend && uvicorn app.main:app --reload --port 8000)`;
}
