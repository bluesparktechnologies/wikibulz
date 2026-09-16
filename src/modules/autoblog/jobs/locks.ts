import { safeRedis } from "@/lib/redis/client";

export async function acquireAutomationLock(key: string, ttlSeconds = 300) {
  const result = await safeRedis((client) => client.set(`autoblog:lock:${key}`, "1", { NX: true, EX: ttlSeconds }));
  return result === "OK";
}

export async function releaseAutomationLock(key: string) {
  await safeRedis((client) => client.del(`autoblog:lock:${key}`));
}

export async function withAutomationLock<T>(key: string, action: () => Promise<T>, ttlSeconds = 300) {
  const acquired = await acquireAutomationLock(key, ttlSeconds);
  if (!acquired) return { ok: false as const, message: "Automation lock already exists." };
  try {
    return { ok: true as const, value: await action() };
  } finally {
    await releaseAutomationLock(key);
  }
}
