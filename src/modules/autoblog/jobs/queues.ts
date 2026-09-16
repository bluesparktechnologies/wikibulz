import { Queue, type JobsOptions } from "bullmq";
import { env } from "@/lib/validation/env";
import { safeRedis } from "@/lib/redis/client";

export const autoblogQueueNames = [
  "planning",
  "keyword-discovery",
  "keyword-analysis",
  "serp-research",
  "research",
  "brief-generation",
  "outline-generation",
  "article-writing",
  "claim-verification",
  "seo-analysis",
  "internal-linking",
  "image-generation",
  "plagiarism",
  "quality-gate",
  "publishing",
  "performance-analysis",
  "content-refresh",
] as const;

export type AutoblogQueueName = typeof autoblogQueueNames[number];
export type AutoblogJobPayload = {
  runId: string;
  stage: string;
  idempotencyKey: string;
  forceRefresh?: boolean;
  input?: Record<string, unknown>;
};

const queues = new Map<AutoblogQueueName, Queue<AutoblogJobPayload>>();

export function getAutoblogQueueKey(name: AutoblogQueueName) {
  return `autoblog-${name}`;
}

function connection() {
  if (!env.REDIS_URL) return null;
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    tls: url.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}

export function getAutoblogQueue(name: AutoblogQueueName) {
  const redisConnection = connection();
  if (!redisConnection) return null;
  const existing = queues.get(name);
  if (existing) return existing;
  try {
    const queue = new Queue<AutoblogJobPayload>(getAutoblogQueueKey(name), {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 30000 },
        removeOnComplete: { age: 60 * 60 * 24 * 7, count: 1000 },
        removeOnFail: { age: 60 * 60 * 24 * 30, count: 2000 },
      },
    });
    queues.set(name, queue);
    return queue;
  } catch (error) {
    console.warn("Autoblog queue unavailable", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function enqueueAutoblogJob(queueName: AutoblogQueueName, payload: AutoblogJobPayload, options: JobsOptions = {}) {
  const queue = getAutoblogQueue(queueName);
  if (!queue) return { ok: false as const, state: "CONFIGURATION_REQUIRED" as const, message: "Redis is required for automation queues." };
  const jobId = payload.idempotencyKey;
  const job = await queue.add(payload.stage, payload, { jobId, ...options });
  return { ok: true as const, jobId: String(job.id), queueName };
}

export async function getQueueSummary() {
  const summaries = await Promise.all(autoblogQueueNames.map(async (name) => {
    const queue = getAutoblogQueue(name);
    if (!queue) return { name, configured: false, waiting: 0, active: 0, failed: 0, delayed: 0 };
    const counts = await queue.getJobCounts("waiting", "active", "failed", "delayed");
    return { name, configured: true, waiting: counts.waiting ?? 0, active: counts.active ?? 0, failed: counts.failed ?? 0, delayed: counts.delayed ?? 0 };
  }));
  return summaries;
}

export async function markAutoblogWorkerHeartbeat() {
  await safeRedis((client) => client.set("autoblog:worker:heartbeat", new Date().toISOString(), { EX: 120 }));
}

export async function getAutomationRuntimeSummary() {
  const workerHeartbeatAt = await safeRedis((client) => client.get("autoblog:worker:heartbeat"));
  const redisPong = await safeRedis((client) => client.ping());
  const heartbeatTime = typeof workerHeartbeatAt === "string" ? Date.parse(workerHeartbeatAt) : NaN;
  const workerHeartbeatStale = !Number.isFinite(heartbeatTime) || Date.now() - heartbeatTime > 120000;
  return {
    redisConfigured: Boolean(env.REDIS_URL),
    redisReachable: redisPong === "PONG",
    workerHeartbeatAt: typeof workerHeartbeatAt === "string" ? workerHeartbeatAt : null,
    workerHeartbeatStale,
  };
}
