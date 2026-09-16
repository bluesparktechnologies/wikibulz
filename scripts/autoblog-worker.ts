import { loadEnvConfig } from "@next/env";
import type { Worker } from "bullmq";

loadEnvConfig(process.cwd());

let workers: Worker[] = [];
let heartbeat: NodeJS.Timeout | null = null;
let scheduler: NodeJS.Timeout | null = null;

async function main() {
  const { markAutoblogWorkerHeartbeat } = await import("../src/modules/autoblog/jobs/queues");
  const { publishDueQueueItems } = await import("../src/modules/autoblog/publishing/scheduled-publisher");
  const { startAutoblogWorkers } = await import("../src/modules/autoblog/workers/autoblog.worker");
  workers = startAutoblogWorkers();
  await markAutoblogWorkerHeartbeat();
  heartbeat = setInterval(() => {
    void markAutoblogWorkerHeartbeat();
  }, 30000);
  scheduler = setInterval(() => {
    void publishDueQueueItems().catch((error) => {
      console.error("Scheduled publisher failed", error);
    });
  }, 60000);
  void publishDueQueueItems().catch((error) => {
    console.error("Scheduled publisher failed", error);
  });
  console.log(`Autoblog workers running: ${workers.length}`);
  console.log("Scheduled publisher loop running every 60 seconds.");
}

async function shutdown() {
  if (heartbeat) clearInterval(heartbeat);
  if (scheduler) clearInterval(scheduler);
  await Promise.all(workers.map((worker) => worker.close()));
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
