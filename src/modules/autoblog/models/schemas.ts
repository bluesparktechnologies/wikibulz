import mongoose, { Schema } from "mongoose";

const JsonSchema = { type: Schema.Types.Mixed, default: {} };

const AutomationStageSchema = new Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ["PENDING", "RUNNING", "WAITING", "PASSED", "FAILED", "SKIPPED", "BLOCKED"], default: "PENDING", index: true },
  idempotencyKey: { type: String, required: true },
  startedAt: Date,
  completedAt: Date,
  attempts: { type: Number, default: 0 },
  outputSummary: String,
  error: String,
}, { _id: false });

const AutomationRunSchema = new Schema({
  status: { type: String, enum: ["QUEUED", "RUNNING", "WAITING", "WAITING_PROVIDER", "NEEDS_REVIEW", "FAILED", "CANCELLED", "COMPLETED"], default: "QUEUED", index: true },
  currentStage: { type: String, required: true, index: true },
  keywordId: { type: Schema.Types.ObjectId, ref: "AutoblogKeyword", index: true },
  postId: { type: Schema.Types.ObjectId, ref: "Post", index: true },
  scheduledFor: { type: Date, index: true },
  startedAt: Date,
  completedAt: Date,
  stages: [AutomationStageSchema],
  errorMessages: [String],
  retryCount: { type: Number, default: 0 },
  qualityScores: JsonSchema,
  providerUsage: JsonSchema,
  dryRun: { type: Boolean, default: true, index: true },
}, { timestamps: true });
AutomationRunSchema.index({ status: 1, scheduledFor: 1 });

const AutomationSettingsSchema = new Schema({
  key: { type: String, unique: true, default: "default", index: true },
  mode: { type: String, enum: ["MANUAL", "ASSISTED", "AUTOPILOT"], default: "ASSISTED" },
  enabled: { type: Boolean, default: false },
  dryRunMode: { type: Boolean, default: true },
  autoPublish: { type: Boolean, default: false },
  useNewsDiscovery: { type: Boolean, default: true },
  publishingMode: { type: String, enum: ["SAVE_DRAFT", "SAVE_FOR_REVIEW", "AUTO_SCHEDULE", "DIRECT_PUBLISH"], default: "SAVE_FOR_REVIEW" },
  plagiarismMode: { type: String, enum: ["MANUAL_CHECK", "LLM_RISK_ONLY", "API_REQUIRED", "DISABLED"], default: "LLM_RISK_ONLY" },
  country: { type: String, default: "US" },
  language: { type: String, default: "en" },
  primaryNiche: { type: String, default: "Personal Finance" },
  allowedCategories: [String],
  excludedTopics: [String],
  minimumOpportunityScore: { type: Number, default: 70 },
  minimumSeoQuality: { type: Number, default: 90 },
  maximumSimilarityPercent: { type: Number, default: 8 },
  factVerificationRequired: { type: Boolean, default: true },
  cannibalizationCheckRequired: { type: Boolean, default: true },
  informationGainRequired: { type: Boolean, default: true },
  minimumReadyBacklog: { type: Number, default: 7 },
  dailyAIBudget: { type: Number, default: 10 },
  monthlyAIBudget: { type: Number, default: 200 },
  maxCostPerArticle: { type: Number, default: 5 },
  maxSERPRequests: { type: Number, default: 100 },
  maxImageGenerations: { type: Number, default: 20 },
  articlesPerDay: { type: Number, default: 2 },
  allowedDays: { type: [Number], default: [1, 2, 3, 4, 5] },
  internalLinksAutomatic: { type: Boolean, default: true },
  reverseInternalLinksEnabled: { type: Boolean, default: true },
  imageGenerationMode: { type: String, enum: ["DISABLED", "WHEN_USEFUL", "REQUIRED"], default: "WHEN_USEFUL" },
  timezone: { type: String, default: "Asia/Kolkata" },
  publishTimes: { type: [String], default: ["10:00", "19:00"] },
}, { timestamps: true });

const SiteNicheProfileSchema = new Schema({
  key: { type: String, unique: true, default: "default", index: true },
  primaryNiche: { type: String, default: "Personal Finance" },
  secondaryTopics: [String],
  country: { type: String, default: "US" },
  language: { type: String, default: "en" },
  targetAudience: { type: String, default: "People making practical money decisions" },
  businessGoals: [String],
  allowedTopics: [String],
  excludedTopics: [String],
  riskCategories: [String],
}, { timestamps: true });

const EditorialProfileSchema = new Schema({
  key: { type: String, unique: true, default: "default", index: true },
  tone: { type: String, default: "clear, practical, evidence-first" },
  audience: { type: String, default: "non-expert readers" },
  readingLevel: { type: String, default: "grade 8-10" },
  paragraphStyle: { type: String, default: "short paragraphs with useful examples" },
  terminology: [String],
  avoidTerms: [String],
  brandVoice: { type: String, default: "calm expert, no hype" },
  citationStyle: { type: String, default: "link material claims to visible reputable sources" },
  formattingPreferences: [String],
}, { timestamps: true });

const ProviderSettingsSchema = new Schema({
  provider: { type: String, required: true, unique: true, index: true },
  enabled: { type: Boolean, default: false },
  requiredForPublish: { type: Boolean, default: false },
  config: JsonSchema,
  lastHealthState: { type: String, enum: ["HEALTHY", "DEGRADED", "DOWN", "RATE_LIMITED", "CONFIGURATION_REQUIRED"], default: "CONFIGURATION_REQUIRED", index: true },
  lastHealthMessage: String,
  lastCheckedAt: Date,
}, { timestamps: true });

const AIUsageRecordSchema = new Schema({
  provider: { type: String, required: true, index: true },
  operation: { type: String, required: true, index: true },
  automationRunId: { type: Schema.Types.ObjectId, ref: "AutomationRun", index: true },
  postId: { type: Schema.Types.ObjectId, ref: "Post", index: true },
  promptTokens: Number,
  completionTokens: Number,
  costUsd: { type: Number, default: 0 },
  latencyMs: Number,
  status: { type: String, enum: ["success", "failed"], default: "success", index: true },
  error: String,
}, { timestamps: true });
AIUsageRecordSchema.index({ provider: 1, createdAt: -1 });

const PromptTemplateSchema = new Schema({
  name: { type: String, required: true, index: true },
  version: { type: Number, required: true, default: 1 },
  taskType: { type: String, required: true, index: true },
  systemPrompt: { type: String, required: true },
  userTemplate: { type: String, required: true },
  model: { type: String, default: "gemini-3.6-flash" },
  temperature: { type: Number, default: 0.4 },
  maxTokens: Number,
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });
PromptTemplateSchema.index({ name: 1, version: 1 }, { unique: true });

const AutomationNotificationSchema = new Schema({
  type: { type: String, required: true, index: true },
  severity: { type: String, enum: ["info", "warning", "critical"], default: "info", index: true },
  message: { type: String, required: true },
  actionUrl: String,
  readAt: Date,
  automationRunId: { type: Schema.Types.ObjectId, ref: "AutomationRun", index: true },
}, { timestamps: true });

const AutomationArtifactSchema = new Schema({
  automationRunId: { type: Schema.Types.ObjectId, ref: "AutomationRun", required: true, index: true },
  stage: { type: String, required: true, index: true },
  artifactType: { type: String, required: true, index: true },
  title: String,
  summary: String,
  data: JsonSchema,
  approvedAt: Date,
  rejectedAt: Date,
  reviewedBy: String,
}, { timestamps: true });
AutomationArtifactSchema.index({ automationRunId: 1, stage: 1, artifactType: 1 });

const PlagiarismScanSchema = new Schema({
  automationRunId: { type: Schema.Types.ObjectId, ref: "AutomationRun", index: true },
  postId: { type: Schema.Types.ObjectId, ref: "Post", index: true },
  provider: { type: String, required: true, index: true },
  scanId: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ["SUBMITTED", "PROCESSING", "COMPLETED", "FAILED"], default: "SUBMITTED", index: true },
  similarityPercent: Number,
  matchedUrls: [String],
  rawResult: JsonSchema,
  submittedAt: { type: Date, default: Date.now, index: true },
  completedAt: Date,
}, { timestamps: true });

const KeywordSchema = new Schema({
  keyword: { type: String, required: true },
  normalizedKeyword: { type: String, required: true, index: true },
  country: { type: String, default: "US", index: true },
  language: { type: String, default: "en", index: true },
  searchVolume: Number,
  adsCompetition: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "UNKNOWN"], default: "UNKNOWN" },
  cpc: Number,
  intent: { type: String, enum: ["INFORMATIONAL", "COMMERCIAL_INVESTIGATION", "TRANSACTIONAL", "NAVIGATIONAL", "LOCAL", "MIXED", "UNKNOWN"], default: "UNKNOWN", index: true },
  clusterId: { type: Schema.Types.ObjectId, ref: "TopicCluster", index: true },
  parentTopic: String,
  topicalRelevance: { type: Number, default: 0 },
  businessValue: { type: Number, default: 0 },
  trafficPotential: { type: Number, default: 0 },
  rankingFeasibility: { type: Number, default: 0 },
  serpWeakness: { type: Number, default: 0 },
  opportunityScore: { type: Number, default: 0, index: true },
  existingPostId: { type: Schema.Types.ObjectId, ref: "Post", index: true },
  plannedPostId: { type: Schema.Types.ObjectId, ref: "Post", index: true },
  status: { type: String, enum: ["NEW", "PLANNED", "PARTIALLY_COVERED", "COVERED", "UPDATE_REQUIRED", "SKIPPED"], default: "NEW", index: true },
  firstSeenAt: Date,
  lastCheckedAt: Date,
}, { timestamps: true });
KeywordSchema.index({ normalizedKeyword: 1, country: 1, language: 1 }, { unique: true });

const TopicClusterSchema = new Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  parentTopic: String,
  status: { type: String, enum: ["NEW", "PLANNED", "PARTIALLY_COVERED", "COVERED", "UPDATE_REQUIRED"], default: "NEW", index: true },
  primaryKeywordId: { type: Schema.Types.ObjectId, ref: "AutoblogKeyword" },
  keywordIds: [{ type: Schema.Types.ObjectId, ref: "AutoblogKeyword" }],
  coveragePercent: { type: Number, default: 0 },
  opportunityScore: { type: Number, default: 0 },
  intent: String,
  assetType: String,
  notes: String,
}, { timestamps: true });

const PublishingQueueSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  automationRunId: { type: Schema.Types.ObjectId, ref: "AutomationRun", index: true },
  status: { type: String, enum: ["PREPARING", "READY", "SCHEDULED", "PUBLISHING", "PUBLISHED", "FAILED", "REVIEW_REQUIRED", "CANCELLED"], default: "PREPARING", index: true },
  scheduledFor: { type: Date, index: true },
  timezone: { type: String, default: "Asia/Kolkata" },
  preparedAt: Date,
  publishedAt: Date,
  qualityScore: Number,
  plagiarismScore: Number,
  factCheckPassed: { type: Boolean, default: false },
  seoPassed: { type: Boolean, default: false },
  imagesReady: { type: Boolean, default: false },
  publishAttempts: { type: Number, default: 0 },
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  lastError: String,
}, { timestamps: true });

const ProviderHealthSchema = new Schema({
  provider: { type: String, required: true, unique: true, index: true },
  state: { type: String, enum: ["HEALTHY", "DEGRADED", "DOWN", "RATE_LIMITED", "CONFIGURATION_REQUIRED"], required: true, index: true },
  message: String,
  latencyMs: Number,
  checkedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

const SerpSnapshotSchema = new Schema({
  keywordId: { type: Schema.Types.ObjectId, ref: "AutoblogKeyword", index: true },
  keyword: { type: String, required: true, index: true },
  country: { type: String, default: "US", index: true },
  language: { type: String, default: "en", index: true },
  provider: { type: String, required: true, index: true },
  rankingUrls: [JsonSchema],
  features: [String],
  peopleAlsoAsk: [String],
  relatedSearches: [String],
  weaknessScore: Number,
  weaknessReasons: [String],
  capturedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });
SerpSnapshotSchema.index({ keyword: 1, country: 1, language: 1, capturedAt: -1 });

const ResearchSourceSchema = new Schema({
  url: { type: String, required: true, index: true },
  title: { type: String, required: true },
  publisher: String,
  author: String,
  publishedAt: Date,
  retrievedAt: { type: Date, default: Date.now, index: true },
  sourceType: { type: String, enum: ["PRIMARY", "OFFICIAL", "GOVERNMENT", "REGULATORY", "ACADEMIC", "OFFICIAL_DOCUMENTATION", "REPUTABLE_INDUSTRY", "HIGH_QUALITY_SECONDARY", "UNKNOWN"], default: "UNKNOWN", index: true },
  authorityLevel: { type: Number, default: 0 },
  timeSensitive: { type: Boolean, default: false, index: true },
  claimsSupported: [String],
  brokenAt: Date,
  outdatedAt: Date,
}, { timestamps: true });

const GscPerformanceSchema = new Schema({
  siteUrl: { type: String, required: true, index: true },
  query: { type: String, required: true, index: true },
  page: { type: String, required: true, index: true },
  clicks: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 },
  position: { type: Number, default: 0 },
  date: { type: Date, required: true, index: true },
}, { timestamps: true });
GscPerformanceSchema.index({ siteUrl: 1, query: 1, page: 1, date: 1 }, { unique: true });

const RefreshCandidateSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", index: true },
  reason: { type: String, required: true },
  severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM", index: true },
  signals: JsonSchema,
  status: { type: String, enum: ["NEW", "REVIEW", "PLANNED", "COMPLETED", "DISMISSED"], default: "NEW", index: true },
}, { timestamps: true });

const SeoExperimentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", index: true },
  experimentType: { type: String, required: true, index: true },
  description: { type: String, required: true },
  beforeMetrics: JsonSchema,
  afterMetrics: JsonSchema,
  changedAt: { type: Date, default: Date.now, index: true },
  evaluatedAt: Date,
  outcome: String,
}, { timestamps: true });

const RoiRecordSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", index: true },
  automationRunId: { type: Schema.Types.ObjectId, ref: "AutomationRun", index: true },
  keywordCostUsd: { type: Number, default: 0 },
  aiCostUsd: { type: Number, default: 0 },
  imageCostUsd: { type: Number, default: 0 },
  serpCostUsd: { type: Number, default: 0 },
  plagiarismCostUsd: { type: Number, default: 0 },
  humanReviewMinutes: { type: Number, default: 0 },
  organicClicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  revenueUsd: { type: Number, default: 0 },
  backlinks: { type: Number, default: 0 },
}, { timestamps: true });

export const AutomationRunModel = mongoose.models.AutomationRun || mongoose.model("AutomationRun", AutomationRunSchema);
export const AutomationSettingsModel = mongoose.models.AutomationSettings || mongoose.model("AutomationSettings", AutomationSettingsSchema);
export const SiteNicheProfileModel = mongoose.models.SiteNicheProfile || mongoose.model("SiteNicheProfile", SiteNicheProfileSchema);
export const EditorialProfileModel = mongoose.models.EditorialProfile || mongoose.model("EditorialProfile", EditorialProfileSchema);
export const ProviderSettingsModel = mongoose.models.ProviderSettings || mongoose.model("ProviderSettings", ProviderSettingsSchema);
export const AIUsageRecordModel = mongoose.models.AIUsageRecord || mongoose.model("AIUsageRecord", AIUsageRecordSchema);
export const PromptTemplateModel = mongoose.models.PromptTemplate || mongoose.model("PromptTemplate", PromptTemplateSchema);
export const AutomationNotificationModel = mongoose.models.AutomationNotification || mongoose.model("AutomationNotification", AutomationNotificationSchema);
export const AutomationArtifactModel = mongoose.models.AutomationArtifact || mongoose.model("AutomationArtifact", AutomationArtifactSchema);
export const PlagiarismScanModel = mongoose.models.PlagiarismScan || mongoose.model("PlagiarismScan", PlagiarismScanSchema);
export const AutoblogKeywordModel = mongoose.models.AutoblogKeyword || mongoose.model("AutoblogKeyword", KeywordSchema);
export const TopicClusterModel = mongoose.models.TopicCluster || mongoose.model("TopicCluster", TopicClusterSchema);
export const PublishingQueueModel = mongoose.models.PublishingQueue || mongoose.model("PublishingQueue", PublishingQueueSchema);
export const ProviderHealthModel = mongoose.models.ProviderHealth || mongoose.model("ProviderHealth", ProviderHealthSchema);
export const SerpSnapshotModel = mongoose.models.SerpSnapshot || mongoose.model("SerpSnapshot", SerpSnapshotSchema);
export const ResearchSourceModel = mongoose.models.ResearchSource || mongoose.model("ResearchSource", ResearchSourceSchema);
export const GscPerformanceModel = mongoose.models.GscPerformance || mongoose.model("GscPerformance", GscPerformanceSchema);
export const RefreshCandidateModel = mongoose.models.RefreshCandidate || mongoose.model("RefreshCandidate", RefreshCandidateSchema);
export const SeoExperimentModel = mongoose.models.SeoExperiment || mongoose.model("SeoExperiment", SeoExperimentSchema);
export const RoiRecordModel = mongoose.models.RoiRecord || mongoose.model("RoiRecord", RoiRecordSchema);
