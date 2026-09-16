import type { ProviderResult } from "@/modules/autoblog/types/providers";

export function okResult<T>(provider: string, data: T, startedAt: number, costUsd?: number): ProviderResult<T> {
  return { ok: true, provider, data, latencyMs: Date.now() - startedAt, costUsd };
}

export function providerError<T>(provider: string, error: unknown, retryable = true): ProviderResult<T> {
  const message = error instanceof Error ? error.message : "Provider request failed.";
  const rateLimited = /429|rate/i.test(message);
  return { ok: false, provider, state: rateLimited ? "RATE_LIMITED" : "DEGRADED", message, retryable };
}

export function basicAuth(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

export async function postJson<T>(url: string, body: unknown, headers: Record<string, string>, timeoutMs = 30000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
    return text ? JSON.parse(text) as T : ({} as T);
  } finally {
    clearTimeout(timeout);
  }
}
