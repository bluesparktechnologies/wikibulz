import crypto from "node:crypto";
import { connectMongo } from "@/lib/db/mongoose";
import { PostModel, postCategoryPopulate } from "@/models/schemas";
import { mapPost } from "@/repositories/mappers";
import { findArticlePublicationBlockers } from "@/modules/autoblog/quality/article-quality";
import {
  AutomationArtifactModel,
  AutomationNotificationModel,
  AutomationRunModel,
  AutomationSettingsModel,
  EditorialProfileModel,
  GscPerformanceModel,
  PlagiarismScanModel,
  ProviderHealthModel,
  ProviderSettingsModel,
  PromptTemplateModel,
  AutoblogKeywordModel,
  PublishingQueueModel,
  RefreshCandidateModel,
  ResearchSourceModel,
  RoiRecordModel,
  SeoExperimentModel,
  SerpSnapshotModel,
  SiteNicheProfileModel,
  TopicClusterModel,
} from "@/modules/autoblog/models/schemas";
import type { AutomationSettings, AutomationStatus, EditorialProfile, ProviderHealthState, SiteNicheProfile } from "@/modules/autoblog/types/automation";
import type { GscMetric, SerpSnapshot } from "@/modules/autoblog/types/providers";

export const automationStages = [
  "planning",
  "keyword-discovery",
  "keyword-analysis",
  "cannibalization",
  "topical-map",
  "opportunity-scoring",
  "serp-research",
  "intent",
  "competitor-research",
  "content-gap",
  "information-gain",
  "research",
  "brief",
  "outline",
  "writing",
  "editing",
  "claims",
  "fact-check",
  "citations",
  "seo-analysis",
  "internal-linking",
  "media",
  "image-generation",
  "similarity",
  "plagiarism",
  "quality-gate",
  "publishing-queue",
  "performance-analysis",
] as const;

export const defaultAutomationSettings: AutomationSettings = {
  mode: "ASSISTED",
  enabled: false,
  dryRunMode: true,
  autoPublish: false,
  useNewsDiscovery: true,
  publishingMode: "SAVE_FOR_REVIEW",
  plagiarismMode: "LLM_RISK_ONLY",
  country: "IN",
  language: "en",
  primaryNiche: "Local Rankings",
  allowedCategories: ["Healthcare", "Education", "Business Services", "Dentists", "IAS Coaching", "SEO Agencies"],
  excludedTopics: [],
  minimumOpportunityScore: 70,
  minimumSeoQuality: 90,
  maximumSimilarityPercent: 8,
  factVerificationRequired: true,
  cannibalizationCheckRequired: true,
  informationGainRequired: true,
  minimumReadyBacklog: 7,
  dailyAIBudget: 10,
  monthlyAIBudget: 200,
  maxCostPerArticle: 5,
  maxSERPRequests: 100,
  maxImageGenerations: 20,
  articlesPerDay: 2,
  allowedDays: [1, 2, 3, 4, 5],
  internalLinksAutomatic: true,
  reverseInternalLinksEnabled: true,
  imageGenerationMode: "WHEN_USEFUL",
  timezone: "Asia/Kolkata",
  publishTimes: ["10:00", "19:00"],
};

export const defaultSiteNicheProfile: SiteNicheProfile = {
  primaryNiche: "Local Rankings",
  secondaryTopics: ["Healthcare", "Education", "Business Services", "Dentists", "IAS Coaching", "SEO Agencies"],
  country: "IN",
  language: "en",
  targetAudience: "Indian readers comparing local services, clinics, institutes, agencies, and city-level business options",
  businessGoals: ["grow useful organic traffic for city-category ranking pages", "build authority around transparent local discovery", "help readers compare local service providers with clear criteria"],
  allowedTopics: ["Healthcare", "Education", "Business Services", "Dentists", "IAS Coaching", "SEO Agencies", "Hospitals", "Schools", "Digital Marketing Agencies"],
  excludedTopics: [],
  riskCategories: ["medical advice", "financial advice", "legal advice", "unsupported result claims", "fake reviews", "unverified business claims"],
};

export const defaultEditorialProfile: EditorialProfile = {
  tone: "clear, practical, evidence-first local service guidance",
  audience: "readers comparing local providers before shortlisting or contacting them",
  readingLevel: "grade 8-10",
  paragraphStyle: "short paragraphs with useful examples",
  terminology: ["plain English", "local ranking criteria", "service-specific terms when useful"],
  avoidTerms: ["guaranteed results", "best without criteria", "paid ranking unless disclosed", "verified if not checked", "exclusive if not sourced"],
  brandVoice: "calm local research editor, no hype",
  citationStyle: "link material claims to visible reputable sources",
  formattingPreferences: ["answer-first intros", "short sections", "comparison criteria", "reader checklists"],
};

export function idempotencyKey(prefix: string, seed: string = crypto.randomUUID()) {
  return `${prefix}-${crypto.createHash("sha256").update(seed).digest("hex").slice(0, 24)}`;
}

export async function getAutomationSettings(): Promise<AutomationSettings> {
  const db = await connectMongo();
  if (!db) return defaultAutomationSettings;
  const doc = await AutomationSettingsModel.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { key: "default", ...defaultAutomationSettings } },
    { upsert: true, returnDocument: "after" },
  ).lean<Record<string, unknown>>();
  return { ...defaultAutomationSettings, ...JSON.parse(JSON.stringify(doc)) };
}

export async function updateAutomationSettings(input: Partial<AutomationSettings>) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required for automation settings.");
  await AutomationSettingsModel.updateOne({ key: "default" }, { $set: { key: "default", ...input } }, { upsert: true, runValidators: true });
  return getAutomationSettings();
}

export async function getSiteNicheProfile(): Promise<SiteNicheProfile> {
  const db = await connectMongo();
  if (!db) return defaultSiteNicheProfile;
  const doc = await SiteNicheProfileModel.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { key: "default", ...defaultSiteNicheProfile } },
    { upsert: true, returnDocument: "after" },
  ).lean<Record<string, unknown>>();
  return { ...defaultSiteNicheProfile, ...JSON.parse(JSON.stringify(doc)) };
}

export async function updateSiteNicheProfile(input: Partial<SiteNicheProfile>) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required for site niche profile.");
  await SiteNicheProfileModel.updateOne({ key: "default" }, { $set: { key: "default", ...input } }, { upsert: true, runValidators: true });
  return getSiteNicheProfile();
}

export async function getEditorialProfile(): Promise<EditorialProfile> {
  const db = await connectMongo();
  if (!db) return defaultEditorialProfile;
  const doc = await EditorialProfileModel.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { key: "default", ...defaultEditorialProfile } },
    { upsert: true, returnDocument: "after" },
  ).lean<Record<string, unknown>>();
  return { ...defaultEditorialProfile, ...JSON.parse(JSON.stringify(doc)) };
}

export async function updateEditorialProfile(input: Partial<EditorialProfile>) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required for editorial profile.");
  await EditorialProfileModel.updateOne({ key: "default" }, { $set: { key: "default", ...input } }, { upsert: true, runValidators: true });
  return getEditorialProfile();
}

export async function createAutomationRun(input: { keywordId?: string; postId?: string; scheduledFor?: Date; dryRun?: boolean }) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required for durable automation runs.");
  const settings = await getAutomationSettings();
  return AutomationRunModel.create({
    status: "QUEUED",
    currentStage: automationStages[0],
    keywordId: input.keywordId,
    postId: input.postId,
    scheduledFor: input.scheduledFor,
    dryRun: input.dryRun ?? settings.dryRunMode,
    stages: automationStages.map((stage) => ({ name: stage, status: "PENDING", idempotencyKey: idempotencyKey(stage), attempts: 0 })),
    errorMessages: [],
    retryCount: 0,
    qualityScores: {},
    providerUsage: {},
  });
}

export async function transitionRunStage(runId: string, stageName: string, status: AutomationStatus | "STAGE_PASSED" | "STAGE_FAILED", message?: string) {
  const db = await connectMongo();
  if (!db) return null;
  const stageStatus = status === "STAGE_PASSED"
    ? "PASSED"
    : status === "STAGE_FAILED" || status === "FAILED"
      ? "FAILED"
      : status === "WAITING" || status === "WAITING_PROVIDER"
        ? "WAITING"
        : status === "NEEDS_REVIEW"
          ? "BLOCKED"
          : status === "CANCELLED"
            ? "SKIPPED"
            : "RUNNING";
  const set: Record<string, unknown> = {
    currentStage: stageName,
    "stages.$.status": stageStatus,
    "stages.$.completedAt": stageStatus === "PASSED" || stageStatus === "FAILED" || stageStatus === "BLOCKED" || stageStatus === "SKIPPED" ? new Date() : undefined,
    "stages.$.error": stageStatus === "FAILED" || stageStatus === "BLOCKED" ? message : undefined,
  };
  if (status !== "STAGE_PASSED" && status !== "STAGE_FAILED") set.status = status;
  const update: Record<string, unknown> = { $set: set, $inc: { "stages.$.attempts": 1 } };
  if (status === "STAGE_FAILED" && message) update.$push = { errorMessages: message };
  return AutomationRunModel.updateOne(
    { _id: runId, "stages.name": stageName },
    update,
  );
}

export function getNextAutomationStage(stageName: string) {
  const index = automationStages.findIndex((stage) => stage === stageName);
  if (index < 0) return null;
  return automationStages[index + 1] ?? null;
}

export async function completeAutomationRun(runId: string) {
  const db = await connectMongo();
  if (!db) return null;
  return AutomationRunModel.updateOne({ _id: runId }, { $set: { status: "COMPLETED", completedAt: new Date() } });
}

export async function createAutomationNotification(input: { type: string; severity?: "info" | "warning" | "critical"; message: string; actionUrl?: string; automationRunId?: string }) {
  const db = await connectMongo();
  if (!db) return null;
  return AutomationNotificationModel.create(input);
}

export async function recordProviderHealth(provider: string, state: ProviderHealthState, message?: string, latencyMs?: number) {
  const db = await connectMongo();
  if (!db) return null;
  await ProviderSettingsModel.updateOne({ provider }, { provider, lastHealthState: state, lastHealthMessage: message, lastCheckedAt: new Date() }, { upsert: true });
  return ProviderHealthModel.updateOne({ provider }, { provider, state, message, latencyMs, checkedAt: new Date() }, { upsert: true });
}

export async function upsertKeyword(input: { keyword: string; country: string; language: string; searchVolume?: number; adsCompetition?: string; cpc?: number }) {
  const db = await connectMongo();
  if (!db) return null;
  const normalizedKeyword = input.keyword.toLowerCase().trim().replace(/\s+/g, " ");
  return AutoblogKeywordModel.findOneAndUpdate(
    { normalizedKeyword, country: input.country, language: input.language },
    { ...input, normalizedKeyword, firstSeenAt: new Date(), lastCheckedAt: new Date() },
    { upsert: true, returnDocument: "after" },
  );
}

export async function updateKeywordAnalysis(keywordId: string, input: Record<string, unknown>) {
  const db = await connectMongo();
  if (!db) return null;
  return AutoblogKeywordModel.findByIdAndUpdate(keywordId, { $set: { ...input, lastCheckedAt: new Date() } }, { returnDocument: "after" });
}

export async function saveSerpSnapshot(snapshot: SerpSnapshot, provider: string, weakness?: { score: number; reasons: string[] }) {
  const db = await connectMongo();
  if (!db) return null;
  return SerpSnapshotModel.create({
    keyword: snapshot.keyword,
    country: snapshot.country,
    language: snapshot.language,
    provider,
    rankingUrls: snapshot.rankingUrls,
    features: snapshot.features,
    peopleAlsoAsk: snapshot.peopleAlsoAsk,
    relatedSearches: snapshot.relatedSearches,
    weaknessScore: weakness?.score,
    weaknessReasons: weakness?.reasons,
    capturedAt: new Date(snapshot.capturedAt),
  });
}

export async function saveGscMetrics(siteUrl: string, metrics: GscMetric[]) {
  const db = await connectMongo();
  if (!db) return 0;
  await Promise.all(metrics.map((metric) => GscPerformanceModel.updateOne(
    { siteUrl, query: metric.query, page: metric.page, date: new Date(metric.date) },
    { ...metric, siteUrl, date: new Date(metric.date) },
    { upsert: true },
  )));
  return metrics.length;
}

export async function createResearchSource(input: {
  url: string;
  title: string;
  publisher?: string;
  sourceType?: string;
  authorityLevel?: number;
  timeSensitive?: boolean;
  claimsSupported?: string[];
}) {
  const db = await connectMongo();
  if (!db) return null;
  return ResearchSourceModel.updateOne({ url: input.url }, { ...input, retrievedAt: new Date() }, { upsert: true });
}

export async function createRefreshCandidate(input: { postId?: string; reason: string; severity?: "LOW" | "MEDIUM" | "HIGH"; signals?: Record<string, unknown> }) {
  const db = await connectMongo();
  if (!db) return null;
  return RefreshCandidateModel.create({ ...input, status: "NEW" });
}

export async function createSeoExperiment(input: { postId?: string; experimentType: string; description: string; beforeMetrics?: Record<string, unknown> }) {
  const db = await connectMongo();
  if (!db) return null;
  return SeoExperimentModel.create({ ...input, changedAt: new Date() });
}

export async function upsertRoiRecord(input: { postId?: string; automationRunId?: string; costs?: Record<string, number>; organicClicks?: number; conversions?: number; revenueUsd?: number; backlinks?: number }) {
  const db = await connectMongo();
  if (!db) return null;
  return RoiRecordModel.updateOne(
    { postId: input.postId, automationRunId: input.automationRunId },
    {
      postId: input.postId,
      automationRunId: input.automationRunId,
      keywordCostUsd: input.costs?.keyword ?? 0,
      aiCostUsd: input.costs?.ai ?? 0,
      imageCostUsd: input.costs?.image ?? 0,
      serpCostUsd: input.costs?.serp ?? 0,
      plagiarismCostUsd: input.costs?.plagiarism ?? 0,
      organicClicks: input.organicClicks ?? 0,
      conversions: input.conversions ?? 0,
      revenueUsd: input.revenueUsd ?? 0,
      backlinks: input.backlinks ?? 0,
    },
    { upsert: true },
  );
}

export async function getBudgetSummary() {
  const db = await connectMongo();
  const settings = await getAutomationSettings();
  if (!db) return { settings, dailyCost: 0, monthlyCost: 0, hardStop: false };
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [daily, monthly] = await Promise.all([
    RoiRecordModel.aggregate([{ $match: { createdAt: { $gte: dayStart } } }, { $group: { _id: null, cost: { $sum: { $add: ["$keywordCostUsd", "$aiCostUsd", "$imageCostUsd", "$serpCostUsd", "$plagiarismCostUsd"] } } } }]),
    RoiRecordModel.aggregate([{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, cost: { $sum: { $add: ["$keywordCostUsd", "$aiCostUsd", "$imageCostUsd", "$serpCostUsd", "$plagiarismCostUsd"] } } } }]),
  ]);
  const dailyCost = daily[0]?.cost ?? 0;
  const monthlyCost = monthly[0]?.cost ?? 0;
  return { settings, dailyCost, monthlyCost, hardStop: dailyCost >= settings.dailyAIBudget || monthlyCost >= settings.monthlyAIBudget };
}

export async function getAutomationDashboard() {
  const db = await connectMongo();
  if (!db) return { settings: defaultAutomationSettings, siteProfile: defaultSiteNicheProfile, editorialProfile: defaultEditorialProfile, budget: { dailyCost: 0, monthlyCost: 0, hardStop: false }, runs: [], providers: [], queue: [], notifications: [], keywords: [], clusters: [] };
  const [settings, siteProfile, editorialProfile, budget, runs, providers, queue, notifications, keywords, clusters] = await Promise.all([
    getAutomationSettings(),
    getSiteNicheProfile(),
    getEditorialProfile(),
    getBudgetSummary(),
    AutomationRunModel.find({}).sort({ updatedAt: -1 }).limit(20).lean(),
    ProviderHealthModel.find({}).sort({ checkedAt: -1 }).lean(),
    PublishingQueueModel.find({}).sort({ scheduledFor: 1 }).limit(20).populate("postId").lean(),
    AutomationNotificationModel.find({ readAt: null }).sort({ createdAt: -1 }).limit(20).lean(),
    AutoblogKeywordModel.find({}).sort({ opportunityScore: -1, updatedAt: -1 }).limit(20).lean(),
    TopicClusterModel.find({}).sort({ opportunityScore: -1, updatedAt: -1 }).limit(20).lean(),
  ]);
  return JSON.parse(JSON.stringify({ settings, siteProfile, editorialProfile, budget, runs, providers, queue, notifications, keywords, clusters }));
}

export async function saveAutomationArtifact(input: { automationRunId: string; stage: string; artifactType: string; title?: string; summary?: string; data?: Record<string, unknown> }) {
  const db = await connectMongo();
  if (!db) return null;
  return AutomationArtifactModel.create(input);
}

export async function getLatestAutomationArtifact<T = Record<string, unknown>>(automationRunId: string, artifactType: string) {
  const db = await connectMongo();
  if (!db) return null;
  const artifact = await AutomationArtifactModel.findOne({ automationRunId, artifactType }).sort({ createdAt: -1 }).lean<{ data?: T }>();
  return artifact?.data ?? null;
}

export async function setAutomationRunPost(runId: string, postId: string) {
  const db = await connectMongo();
  if (!db) return null;
  return AutomationRunModel.updateOne({ _id: runId }, { $set: { postId } });
}

export async function setAutomationRunKeyword(runId: string, keywordId: string) {
  const db = await connectMongo();
  if (!db) return null;
  return AutomationRunModel.updateOne({ _id: runId }, { $set: { keywordId } });
}

export async function upsertPublishingQueueItem(input: {
  postId: string;
  automationRunId: string;
  status: "PREPARING" | "READY" | "SCHEDULED" | "REVIEW_REQUIRED";
  idempotencyKey: string;
  scheduledFor?: Date;
  timezone: string;
  qualityScore?: number;
  plagiarismScore?: number;
  factCheckPassed: boolean;
  seoPassed: boolean;
  imagesReady: boolean;
  lastError?: string;
}) {
  const db = await connectMongo();
  if (!db) return null;
  return PublishingQueueModel.findOneAndUpdate(
    { idempotencyKey: input.idempotencyKey },
    { $set: { ...input, preparedAt: new Date() } },
    { upsert: true, returnDocument: "after" },
  );
}

export async function approvePublishingQueueItem(queueItemId: string, reviewedBy: string) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required for publishing queue approvals.");
  const item = await PublishingQueueModel.findById(queueItemId);
  if (!item) throw new Error("Queue item not found.");
  if (["PUBLISHED", "PUBLISHING", "CANCELLED"].includes(item.status)) throw new Error("Queue item cannot be approved in its current state.");
  const postDoc = await PostModel.findById(item.postId).populate("author reviewer factCheckedBy tags").populate(postCategoryPopulate).lean();
  if (!postDoc) throw new Error("Linked post not found.");
  const blockers = findArticlePublicationBlockers(mapPost(JSON.parse(JSON.stringify(postDoc))));
  if (blockers.length) throw new Error(blockers.join(" "));
  await PublishingQueueModel.updateOne(
    { _id: queueItemId },
    {
      $set: {
        status: "READY",
        factCheckPassed: true,
        seoPassed: true,
        imagesReady: true,
        lastError: null,
        preparedAt: new Date(),
      },
    },
  );
  await AutomationNotificationModel.create({
    type: "queue-approved",
    severity: "info",
    automationRunId: item.automationRunId,
    message: `Queue item manually approved by ${reviewedBy}.`,
  });
  return PublishingQueueModel.findById(queueItemId).lean();
}

export async function schedulePublishingQueueItem(queueItemId: string, scheduledFor: Date) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required for publishing queue scheduling.");
  if (Number.isNaN(scheduledFor.getTime())) throw new Error("Valid schedule time is required.");
  const item = await PublishingQueueModel.findById(queueItemId);
  if (!item) throw new Error("Queue item not found.");
  if (["PUBLISHED", "PUBLISHING", "CANCELLED"].includes(item.status)) throw new Error("Queue item cannot be scheduled in its current state.");
  if (item.status !== "READY") throw new Error("Approve the queue item before scheduling.");
  if (!item.factCheckPassed || !item.seoPassed || !item.imagesReady) throw new Error("Queue item must pass facts, SEO, and image checks before scheduling.");
  const postDoc = await PostModel.findById(item.postId).populate("author reviewer factCheckedBy tags").populate(postCategoryPopulate).lean();
  if (!postDoc) throw new Error("Linked post not found.");
  const blockers = findArticlePublicationBlockers(mapPost(JSON.parse(JSON.stringify(postDoc))));
  if (blockers.length) throw new Error(blockers.join(" "));
  await Promise.all([
    PublishingQueueModel.updateOne({ _id: queueItemId }, { $set: { status: "SCHEDULED", scheduledFor, lastError: null } }),
    PostModel.updateOne({ _id: item.postId, status: { $in: ["draft", "review", "scheduled"] } }, { $set: { status: "scheduled", scheduledAt: scheduledFor } }),
  ]);
  return PublishingQueueModel.findById(queueItemId).lean();
}

export async function cancelPublishingQueueItem(queueItemId: string, reason = "Cancelled from automation dashboard.") {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required for publishing queue cancellation.");
  const item = await PublishingQueueModel.findById(queueItemId);
  if (!item) throw new Error("Queue item not found.");
  if (item.status === "PUBLISHED") throw new Error("Published queue items cannot be cancelled.");
  await Promise.all([
    PublishingQueueModel.updateOne({ _id: queueItemId }, { $set: { status: "CANCELLED", lastError: reason } }),
    PostModel.updateOne({ _id: item.postId, status: "scheduled" }, { $set: { status: "review", scheduledAt: null } }),
  ]);
  return PublishingQueueModel.findById(queueItemId).lean();
}

export async function markQueueItemFailed(queueItemId: string, reason: string) {
  const db = await connectMongo();
  if (!db) return null;
  return PublishingQueueModel.updateOne({ _id: queueItemId }, { $set: { status: "FAILED", lastError: reason } });
}

export async function setAutomationRunStatus(runId: string, status: Extract<AutomationStatus, "CANCELLED" | "FAILED" | "NEEDS_REVIEW">, message?: string) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required for automation run updates.");
  const update: Record<string, unknown> = { $set: { status } };
  if (message) update.$push = { errorMessages: message };
  if (status === "CANCELLED" || status === "FAILED") (update.$set as Record<string, unknown>).completedAt = new Date();
  return AutomationRunModel.updateOne({ _id: runId }, update);
}

export async function getAutomationRunRetryInput(runId: string) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required for automation run retry.");
  const run = await AutomationRunModel.findById(runId).lean<{ keywordId?: unknown; postId?: unknown }>();
  if (!run) throw new Error("Automation run not found.");
  return {
    keywordId: run.keywordId ? String(run.keywordId) : undefined,
    postId: run.postId ? String(run.postId) : undefined,
  };
}

export async function getAutomationRunDetail(runId: string) {
  const db = await connectMongo();
  if (!db) return null;
  const [run, artifacts, notifications] = await Promise.all([
    AutomationRunModel.findById(runId).lean(),
    AutomationArtifactModel.find({ automationRunId: runId }).sort({ createdAt: 1 }).lean(),
    AutomationNotificationModel.find({ automationRunId: runId }).sort({ createdAt: -1 }).lean(),
  ]);
  return JSON.parse(JSON.stringify({ run, artifacts, notifications }));
}

export async function getAutomationCalendar() {
  const db = await connectMongo();
  if (!db) return { queue: [], refreshes: [] };
  const [queue, refreshes] = await Promise.all([
    PublishingQueueModel.find({}).sort({ scheduledFor: 1 }).limit(100).populate("postId").lean(),
    RefreshCandidateModel.find({ status: { $in: ["NEW", "REVIEW", "PLANNED"] } }).sort({ updatedAt: -1 }).limit(50).populate("postId").lean(),
  ]);
  return JSON.parse(JSON.stringify({ queue, refreshes }));
}

export async function getPromptTemplates() {
  const db = await connectMongo();
  if (!db) return [];
  return JSON.parse(JSON.stringify(await PromptTemplateModel.find({}).sort({ taskType: 1, version: -1 }).lean()));
}

export async function getProviderSettings() {
  const db = await connectMongo();
  if (!db) return [];
  const defaults = [
    { provider: "Gemini Text", enabled: true, requiredForPublish: true },
    { provider: "MongoDB", enabled: true, requiredForPublish: true },
    { provider: "Redis", enabled: true, requiredForPublish: true },
    { provider: "Nano Banana Image", enabled: true, requiredForPublish: false },
    { provider: "Google Search Console", enabled: true, requiredForPublish: false },
    { provider: "News Discovery", enabled: true, requiredForPublish: false },
    { provider: "Google Ads Keyword Planner", enabled: true, requiredForPublish: false },
    { provider: "DataForSEO", enabled: false, requiredForPublish: false },
    { provider: "Copyleaks", enabled: false, requiredForPublish: false },
  ];
  await Promise.all(defaults.map((item) => ProviderSettingsModel.updateOne(
    { provider: item.provider },
    { $setOnInsert: item },
    { upsert: true },
  )));
  return JSON.parse(JSON.stringify(await ProviderSettingsModel.find({}).sort({ provider: 1 }).lean()));
}

export async function updateProviderSetting(provider: string, input: { enabled: boolean; requiredForPublish: boolean }) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required for provider settings.");
  await ProviderSettingsModel.updateOne({ provider }, { $set: { provider, ...input } }, { upsert: true, runValidators: true });
}

export async function recordPlagiarismScan(input: { automationRunId?: string; postId?: string; provider: string; scanId: string; status?: "SUBMITTED" | "PROCESSING" | "COMPLETED" | "FAILED"; similarityPercent?: number; matchedUrls?: string[]; rawResult?: Record<string, unknown> }) {
  const db = await connectMongo();
  if (!db) return null;
  return PlagiarismScanModel.updateOne(
    { scanId: input.scanId },
    { ...input, completedAt: input.status === "COMPLETED" || input.status === "FAILED" ? new Date() : undefined },
    { upsert: true },
  );
}

export async function seedPromptTemplates() {
  const db = await connectMongo();
  if (!db) return 0;
  const sharedPolicy = [
    "Use only the supplied topic, keyword data, SERP notes, and source links.",
    "Do not copy sentences from sources. Do not invent facts, numbers, quotes, dates, launches, or citations.",
    "For news, separate confirmed facts from analysis and return NEEDS_REVIEW when sources are weak.",
    "Write for real readers first, then SEO. Use keywords naturally and avoid stuffing.",
    "Never claim content is human-written or try to bypass AI detectors.",
  ].join(" ");
  const templates = [
    { name: "KeywordStrategist", systemPrompt: `You are a senior local SEO keyword strategist for Wikibulz. ${sharedPolicy}` },
    { name: "ContentBriefExpert", systemPrompt: `You create concise briefs for city-category ranking guides across healthcare, education, and business services. Avoid unsupported rankings, paid-placement language, and repeated headline patterns. ${sharedPolicy}` },
    { name: "SeniorWriter", systemPrompt: `You are a senior local research editor writing original, source-aware city service guides for Wikibulz. If a source is supplied, explain the actual source details. If the topic is keyword-only, write an evergreen practical comparison guide and do not pretend it is news. Choose the angle from the local service topic: healthcare, education, coaching, agencies, clinics, schools, or business services. Use the primary keyword in the SEO title, intro, one H2, and conclusion only when natural. Use secondary keywords naturally. Create clear HTML with h2/h3 sections, short paragraphs, practical comparison criteria, varied headlines, and no copied phrasing. Do not publish fake ratings, unsupported claims, or guaranteed outcomes. ${sharedPolicy}` },
    { name: "SeniorEditor", systemPrompt: `You edit local ranking guides for accuracy, clarity, usefulness, and SEO quality without adding unsupported claims. ${sharedPolicy}` },
    { name: "FactChecker", systemPrompt: `You check whether the article's factual claims are supported by supplied sources. Return conservative results. ${sharedPolicy}` },
    { name: "SeniorSEOAuditor", systemPrompt: `You audit title, meta description, headings, keyword use, internal links, schema fit, and reader value. ${sharedPolicy}` },
    { name: "ImagePlanner", systemPrompt: `You plan a balanced local guide cover image from the article brief. Avoid fake logos, text overlays, misleading scenes, clutter, stereotypes, and exaggerated visuals. ${sharedPolicy}` },
    { name: "ImagePromptEngineer", systemPrompt: `You write image prompts for professional local discovery guide covers. The result should be clear, modern, useful, and neither overdesigned nor too minimal. ${sharedPolicy}` },
    ...["KeywordClusterer", "SearchIntentExpert", "SERPAnalyst", "CompetitorAnalyst", "TopicGapAnalyst", "Researcher", "SourceEvaluator", "OutlineExpert", "ClaimExtractor", "InformationGainReviewer", "InternalLinkExpert", "PlagiarismRewriteEditor", "ContentRefreshExpert", "ConsolidationExpert"].map((name) => ({ name, systemPrompt: `${name}: ${sharedPolicy}` })),
  ];
  await Promise.all(templates.map(({ name, systemPrompt }) => PromptTemplateModel.updateOne(
    { name, version: 1 },
    { name, version: 1, taskType: name, systemPrompt, userTemplate: "{{input}}", model: "gemini-3.6-flash", temperature: 0.4, active: true },
    { upsert: true },
  )));
  return templates.length;
}
