import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redisStore = vi.hoisted(() => new Map<string, string>());

vi.mock("@/lib/redis/client", () => ({
  safeRedis: async (operation: (client: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<string>;
    del: (key: string) => Promise<number>;
  }) => Promise<unknown>) => operation({
    get: async (key) => redisStore.get(key) ?? null,
    set: async (key, value) => { redisStore.set(key, value); return "OK"; },
    del: async (key) => Number(redisStore.delete(key)),
  }),
}));

import { getCacheKey, getCachedJson } from "./cache";

describe("production content cache safety", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    redisStore.clear();
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
  });

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
  });

  it("does not return legacy raw demo cache data in production", async () => {
    const key = getCacheKey("posts:published:20:1");
    redisStore.set(key, JSON.stringify([{ id: "sample-post", status: "published", robotsIndex: true }]));
    const loader = vi.fn(async () => { throw new Error("MongoDB is required for public content in production"); });

    await expect(getCachedJson("posts:published:20:1", loader, 180, { origin: "mongodb" })).rejects.toThrow("MongoDB is required");
    expect(loader).toHaveBeenCalledOnce();
  });

  it("rejects a cache envelope from another origin before loading production content", async () => {
    const key = getCacheKey("posts:published:20:1");
    redisStore.set(key, JSON.stringify({ version: 2, environment: "production", origin: "sample-data", value: [{ id: "sample-post" }] }));
    const value = await getCachedJson("posts:published:20:1", async () => [{ id: "database-post" }], 180, { origin: "mongodb" });

    expect(value).toEqual([{ id: "database-post" }]);
  });
});
