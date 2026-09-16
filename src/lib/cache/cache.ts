import { safeRedis } from "@/lib/redis/client";

const CACHE_VERSION = 2;
type CacheEnvironment = "production" | "development";
type CacheOptions<T> = { origin?: string; validate?: (value: T) => boolean };
type CacheEnvelope<T> = { version: number; environment: CacheEnvironment; origin: string; value: T };

function cacheEnvironment(): CacheEnvironment {
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export function getCacheKey(key: string) {
  return `seo-blog:v${CACHE_VERSION}:${cacheEnvironment()}:${key}`;
}

function isCacheEnvelope<T>(value: unknown, origin: string): value is CacheEnvelope<T> {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<CacheEnvelope<T>>;
  return entry.version === CACHE_VERSION && entry.environment === cacheEnvironment() && entry.origin === origin && "value" in entry;
}

export async function getCachedJson<T>(key: string, loader: () => Promise<T>, ttlSeconds = 300, options: CacheOptions<T> = {}): Promise<T> {
  const namespacedKey = getCacheKey(key);
  const origin = options.origin ?? "application";
  const cached = await safeRedis((client) => client.get(namespacedKey));
  if (cached) {
    try {
      const entry = JSON.parse(cached) as unknown;
      if (isCacheEnvelope<T>(entry, origin) && (options.validate?.(entry.value) ?? true)) return entry.value;
    } catch {
      // Invalid or legacy cache data must never be trusted.
    }
    await safeRedis((client) => client.del(namespacedKey));
  }
  const value = await loader();
  const entry: CacheEnvelope<T> = { version: CACHE_VERSION, environment: cacheEnvironment(), origin, value };
  await safeRedis((client) => client.set(namespacedKey, JSON.stringify(entry), { EX: ttlSeconds }));
  return value;
}

export async function deleteCacheKeys(keys: string[]) {
  if (keys.length) await safeRedis((client) => client.del(keys.map(getCacheKey)));
}
