export type AutomationStatus = "QUEUED" | "RUNNING" | "WAITING" | "WAITING_PROVIDER" | "NEEDS_REVIEW" | "FAILED" | "CANCELLED" | "COMPLETED";
export type AutomationStageStatus = "PENDING" | "RUNNING" | "WAITING" | "PASSED" | "FAILED" | "SKIPPED" | "BLOCKED";
export type ProviderHealthState = "HEALTHY" | "DEGRADED" | "DOWN" | "RATE_LIMITED" | "CONFIGURATION_REQUIRED";
export type AutomationMode = "MANUAL" | "ASSISTED" | "AUTOPILOT";
export type AutomationPublishingMode = "SAVE_DRAFT" | "SAVE_FOR_REVIEW" | "AUTO_SCHEDULE" | "DIRECT_PUBLISH";
export type AutomationPlagiarismMode = "MANUAL_CHECK" | "LLM_RISK_ONLY" | "API_REQUIRED" | "DISABLED";
export type KeywordIntent = "INFORMATIONAL" | "COMMERCIAL_INVESTIGATION" | "TRANSACTIONAL" | "NAVIGATIONAL" | "LOCAL" | "MIXED" | "UNKNOWN";
export type ContentAssetType = "ARTICLE" | "GUIDE" | "TUTORIAL" | "LIST" | "COMPARISON" | "REVIEW" | "DEFINITION" | "NEWS" | "STATISTICS" | "CALCULATOR" | "TOOL" | "CHECKLIST" | "TEMPLATE" | "QUIZ" | "GLOSSARY" | "DATA_PAGE" | "REFERENCE" | "LANDING_PAGE";
export type PublishingQueueStatus = "PREPARING" | "READY" | "SCHEDULED" | "PUBLISHING" | "PUBLISHED" | "FAILED" | "REVIEW_REQUIRED" | "CANCELLED";

export type AutomationStage = {
  name: string;
  status: AutomationStageStatus;
  idempotencyKey: string;
  startedAt?: string;
  completedAt?: string;
  attempts: number;
  outputSummary?: string;
  error?: string;
};

export type AutomationRun = {
  id: string;
  status: AutomationStatus;
  currentStage: string;
  keywordId?: string;
  postId?: string;
  scheduledFor?: string;
  startedAt?: string;
  completedAt?: string;
  stages: AutomationStage[];
  errorMessages: string[];
  retryCount: number;
  qualityScores: Record<string, number>;
  providerUsage: Record<string, number>;
  dryRun: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AutomationSettings = {
  mode: AutomationMode;
  enabled: boolean;
  dryRunMode: boolean;
  autoPublish: boolean;
  useNewsDiscovery: boolean;
  publishingMode: AutomationPublishingMode;
  plagiarismMode: AutomationPlagiarismMode;
  country: string;
  language: string;
  primaryNiche: string;
  allowedCategories: string[];
  excludedTopics: string[];
  minimumOpportunityScore: number;
  minimumSeoQuality: number;
  maximumSimilarityPercent: number;
  factVerificationRequired: boolean;
  cannibalizationCheckRequired: boolean;
  informationGainRequired: boolean;
  minimumReadyBacklog: number;
  dailyAIBudget: number;
  monthlyAIBudget: number;
  maxCostPerArticle: number;
  maxSERPRequests: number;
  maxImageGenerations: number;
  articlesPerDay: number;
  allowedDays: number[];
  internalLinksAutomatic: boolean;
  reverseInternalLinksEnabled: boolean;
  imageGenerationMode: "DISABLED" | "WHEN_USEFUL" | "REQUIRED";
  timezone: string;
  publishTimes: string[];
};

export type SiteNicheProfile = {
  primaryNiche: string;
  secondaryTopics: string[];
  country: string;
  language: string;
  targetAudience: string;
  businessGoals: string[];
  allowedTopics: string[];
  excludedTopics: string[];
  riskCategories: string[];
};

export type EditorialProfile = {
  tone: string;
  audience: string;
  readingLevel: string;
  paragraphStyle: string;
  terminology: string[];
  avoidTerms: string[];
  brandVoice: string;
  citationStyle: string;
  formattingPreferences: string[];
};
