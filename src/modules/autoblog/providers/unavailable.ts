import type { ProviderHealthState } from "@/modules/autoblog/types/automation";
import type { ProviderResult } from "@/modules/autoblog/types/providers";

export function unavailableProvider<T>(provider: string, message = "Provider credentials are not configured."): ProviderResult<T> {
  return { ok: false, provider, state: "CONFIGURATION_REQUIRED", message, retryable: false };
}

export function healthResult(provider: string, state: ProviderHealthState, message?: string): ProviderResult<{ state: ProviderHealthState }> {
  if (state === "HEALTHY") return { ok: true, provider, data: { state } };
  return { ok: false, provider, state, message: message ?? `${provider} is not ready.`, retryable: state === "RATE_LIMITED" || state === "DEGRADED" };
}
