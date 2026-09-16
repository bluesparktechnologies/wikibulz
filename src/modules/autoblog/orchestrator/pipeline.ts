import { enqueueAutoblogJob } from "@/modules/autoblog/jobs/queues";
import { automationStages, createAutomationRun, idempotencyKey } from "@/modules/autoblog/repositories/automation.repository";

const stageToQueue = {
  "planning": "planning",
  "keyword-discovery": "keyword-discovery",
  "keyword-analysis": "keyword-analysis",
  "cannibalization": "keyword-analysis",
  "topical-map": "keyword-analysis",
  "opportunity-scoring": "keyword-analysis",
  "serp-research": "serp-research",
  "intent": "serp-research",
  "competitor-research": "serp-research",
  "content-gap": "research",
  "information-gain": "research",
  "research": "research",
  "brief": "brief-generation",
  "outline": "outline-generation",
  "writing": "article-writing",
  "editing": "article-writing",
  "claims": "claim-verification",
  "fact-check": "claim-verification",
  "citations": "claim-verification",
  "seo-analysis": "seo-analysis",
  "internal-linking": "internal-linking",
  "media": "image-generation",
  "image-generation": "image-generation",
  "similarity": "plagiarism",
  "plagiarism": "plagiarism",
  "quality-gate": "quality-gate",
  "publishing-queue": "publishing",
  "performance-analysis": "performance-analysis",
} as const;

export async function startAutomationPipeline(input: { keywordId?: string; postId?: string; scheduledFor?: Date; dryRun?: boolean }) {
  const run = await createAutomationRun(input);
  const firstStage = automationStages[0];
  const result = await enqueueAutoblogJob(stageToQueue[firstStage], {
    runId: String(run._id),
    stage: firstStage,
    idempotencyKey: idempotencyKey(firstStage, String(run._id)),
    forceRefresh: true,
  });
  return { runId: String(run._id), queue: result };
}

export async function startDryRunPipeline(input: { keywordId?: string; postId?: string }) {
  return startAutomationPipeline({ ...input, dryRun: true });
}

export function getPipelineStages() {
  return automationStages.map((stage) => ({ stage, queue: stageToQueue[stage] }));
}
