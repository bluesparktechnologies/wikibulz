import { createClient } from "redis";
import { env } from "@/lib/validation/env";

type RedisClient = ReturnType<typeof createClient<Record<string, never>, Record<string, never>, Record<string, never>>>;
const globalForRedis = globalThis as typeof globalThis & { redisClient?: RedisClient; redisUnavailableUntil?: number };

export async function getRedis() {
  if (!env.REDIS_URL) return null;
  if (globalForRedis.redisUnavailableUntil && globalForRedis.redisUnavailableUntil > Date.now()) return null;
  let client = globalForRedis.redisClient;
  if (!client) {
    client = createClient({
      url: env.REDIS_URL,
      socket: {
        connectTimeout: 500,
        reconnectStrategy: false,
      },
    });
    client.on("error", (error) => console.warn("Redis unavailable", error.message));
    globalForRedis.redisClient = client;
  }
  if (!client.isOpen) {
    try {
      await client.connect();
      globalForRedis.redisUnavailableUntil = undefined;
    } catch {
      // Redis is an optional cache; avoid retry storms when it is not running.
      globalForRedis.redisUnavailableUntil = Date.now() + 60_000;
      return null;
    }
  }
  return client;
}

export async function safeRedis<T>(operation: (client: RedisClient) => Promise<T>) {
  try {
    const client = await getRedis();
    return client ? await operation(client) : null;
  } catch (error) {
    console.warn("Redis operation skipped", error instanceof Error ? error.message : error);
    return null;
  }
}
