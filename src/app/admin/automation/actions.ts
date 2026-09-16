"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { publishQueueItemExactlyOnce } from "@/modules/autoblog/publishing/publisher";
import { providerRegistry } from "@/modules/autoblog/providers/registry";
import {
  approvePublishingQueueItem,
  cancelPublishingQueueItem,
  getAutomationRunRetryInput,
  getAutomationSettings,
  markQueueItemFailed,
  recordProviderHealth,
  seedPromptTemplates,
  setAutomationRunStatus,
  updateAutomationSettings,
  updateEditorialProfile,
  updateProviderSetting,
  updateSiteNicheProfile,
  schedulePublishingQueueItem,
} from "@/modules/autoblog/repositories/automation.repository";
import { startAutomationPipeline, startDryRunPipeline } from "@/modules/autoblog/orchestrator/pipeline";

export type AutomationActionState = { ok: boolean; message: string };

export async function seedPromptsAction(_state: AutomationActionState, _formData: FormData): Promise<AutomationActionState> {
  void _state;
  void _formData;
  await requireRole("seo");
  const count = await seedPromptTemplates();
  revalidatePath("/admin/automation");
  return { ok: true, message: `${count} prompt templates synced.` };
}

export async function refreshProviderHealthAction(_state: AutomationActionState, _formData: FormData): Promise<AutomationActionState> {
  void _state;
  void _formData;
  await requireRole("seo");
  for (const provider of providerRegistry) {
    const started = Date.now();
    const health = await provider.health();
    await recordProviderHealth(provider.name, health.ok ? health.data.state : health.state, health.ok ? "Provider healthy." : health.message, Date.now() - started);
  }
  revalidatePath("/admin/automation");
  return { ok: true, message: "Provider health refreshed." };
}

export async function startDryRunAction(_state: AutomationActionState, _formData: FormData): Promise<AutomationActionState> {
  void _state;
  void _formData;
  await requireRole("seo");
  try {
    const result = await startDryRunPipeline({});
    revalidatePath("/admin/automation");
    return { ok: true, message: `Dry-run pipeline queued: ${result.runId}` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not start dry-run pipeline." };
  }
}

export async function startProductionRunAction(_state: AutomationActionState, _formData: FormData): Promise<AutomationActionState> {
  void _state;
  void _formData;
  await requireRole("admin");
  try {
    const settings = await getAutomationSettings();
    if (!settings.enabled) return { ok: false, message: "Enable automation before starting a production run." };
    if (settings.dryRunMode) return { ok: false, message: "Turn Dry Run off before starting a production run." };
    const result = await startAutomationPipeline({ dryRun: false });
    revalidatePath("/admin/automation");
    return { ok: true, message: `Production pipeline queued: ${result.runId}` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not start production pipeline." };
  }
}

const val = (formData: FormData, key: string) => formData.get(key)?.toString() ?? "";
const csv = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const nums = (value: string) => csv(value).map((item) => Number(item)).filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);
const num = (formData: FormData, key: string, fallback: number) => {
  const value = Number(val(formData, key));
  return Number.isFinite(value) ? value : fallback;
};

export async function saveAutomationSettingsAction(_state: AutomationActionState, formData: FormData): Promise<AutomationActionState> {
  await requireRole("admin");
  try {
    await updateAutomationSettings({
      mode: (val(formData, "mode") || "ASSISTED") as "MANUAL" | "ASSISTED" | "AUTOPILOT",
      enabled: formData.has("enabled"),
      dryRunMode: formData.has("dryRunMode"),
      autoPublish: formData.has("autoPublish"),
      useNewsDiscovery: formData.has("useNewsDiscovery"),
      publishingMode: (val(formData, "publishingMode") || "SAVE_FOR_REVIEW") as "SAVE_DRAFT" | "SAVE_FOR_REVIEW" | "AUTO_SCHEDULE" | "DIRECT_PUBLISH",
      plagiarismMode: (val(formData, "plagiarismMode") || "LLM_RISK_ONLY") as "MANUAL_CHECK" | "LLM_RISK_ONLY" | "API_REQUIRED" | "DISABLED",
      country: val(formData, "country") || "US",
      language: val(formData, "language") || "en",
      primaryNiche: val(formData, "primaryNiche") || "Personal Finance",
      allowedCategories: csv(val(formData, "allowedCategories")),
      excludedTopics: csv(val(formData, "excludedTopics")),
      minimumOpportunityScore: num(formData, "minimumOpportunityScore", 70),
      minimumSeoQuality: num(formData, "minimumSeoQuality", 90),
      maximumSimilarityPercent: num(formData, "maximumSimilarityPercent", 8),
      factVerificationRequired: formData.has("factVerificationRequired"),
      cannibalizationCheckRequired: formData.has("cannibalizationCheckRequired"),
      informationGainRequired: formData.has("informationGainRequired"),
      minimumReadyBacklog: num(formData, "minimumReadyBacklog", 7),
      dailyAIBudget: num(formData, "dailyAIBudget", 10),
      monthlyAIBudget: num(formData, "monthlyAIBudget", 200),
      maxCostPerArticle: num(formData, "maxCostPerArticle", 5),
      maxSERPRequests: num(formData, "maxSERPRequests", 100),
      maxImageGenerations: num(formData, "maxImageGenerations", 20),
      articlesPerDay: num(formData, "articlesPerDay", 2),
      allowedDays: nums(val(formData, "allowedDays")),
      internalLinksAutomatic: formData.has("internalLinksAutomatic"),
      reverseInternalLinksEnabled: formData.has("reverseInternalLinksEnabled"),
      imageGenerationMode: (val(formData, "imageGenerationMode") || "WHEN_USEFUL") as "DISABLED" | "WHEN_USEFUL" | "REQUIRED",
      timezone: val(formData, "timezone") || "Asia/Kolkata",
      publishTimes: csv(val(formData, "publishTimes")),
    });
    await updateSiteNicheProfile({
      primaryNiche: val(formData, "primaryNiche") || "Personal Finance",
      secondaryTopics: csv(val(formData, "secondaryTopics")),
      country: val(formData, "country") || "US",
      language: val(formData, "language") || "en",
      targetAudience: val(formData, "targetAudience"),
      businessGoals: csv(val(formData, "businessGoals")),
      allowedTopics: csv(val(formData, "allowedTopics")),
      excludedTopics: csv(val(formData, "excludedTopics")),
      riskCategories: csv(val(formData, "riskCategories")),
    });
    await updateEditorialProfile({
      tone: val(formData, "tone"),
      audience: val(formData, "audience"),
      readingLevel: val(formData, "readingLevel"),
      paragraphStyle: val(formData, "paragraphStyle"),
      terminology: csv(val(formData, "terminology")),
      avoidTerms: csv(val(formData, "avoidTerms")),
      brandVoice: val(formData, "brandVoice"),
      citationStyle: val(formData, "citationStyle"),
      formattingPreferences: csv(val(formData, "formattingPreferences")),
    });
    revalidatePath("/admin/automation");
    return { ok: true, message: "Automation settings saved." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Automation settings could not be saved." };
  }
}

export async function saveProviderSettingAction(_state: AutomationActionState, formData: FormData): Promise<AutomationActionState> {
  await requireRole("admin");
  try {
    const provider = val(formData, "provider");
    if (!provider) return { ok: false, message: "Provider missing." };
    await updateProviderSetting(provider, { enabled: formData.has("enabled"), requiredForPublish: formData.has("requiredForPublish") });
    revalidatePath("/admin/automation/providers");
    revalidatePath("/admin/automation");
    return { ok: true, message: "Provider setting saved." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Provider setting could not be saved." };
  }
}

const queueId = (formData: FormData) => formData.get("queueItemId")?.toString() ?? "";
const runId = (formData: FormData) => formData.get("runId")?.toString() ?? "";

function revalidateAutomationSurfaces() {
  revalidatePath("/admin/automation");
  revalidatePath("/admin/automation/queue");
  revalidatePath("/admin/automation/calendar");
}

export async function approveQueueItemAction(formData: FormData) {
  const user = await requireRole("admin");
  const id = queueId(formData);
  if (!id) throw new Error("Queue item missing.");
  await approvePublishingQueueItem(id, user.email);
  revalidateAutomationSurfaces();
}

export async function scheduleQueueItemAction(formData: FormData) {
  await requireRole("admin");
  const id = queueId(formData);
  const scheduledFor = new Date(formData.get("scheduledFor")?.toString() ?? "");
  if (!id) throw new Error("Queue item missing.");
  await schedulePublishingQueueItem(id, scheduledFor);
  revalidateAutomationSurfaces();
}

export async function cancelQueueItemAction(formData: FormData) {
  await requireRole("admin");
  const id = queueId(formData);
  if (!id) throw new Error("Queue item missing.");
  await cancelPublishingQueueItem(id);
  revalidateAutomationSurfaces();
}

export async function publishQueueItemNowAction(formData: FormData) {
  await requireRole("admin");
  const id = queueId(formData);
  if (!id) throw new Error("Queue item missing.");
  const result = await publishQueueItemExactlyOnce(id);
  if (!result.ok) {
    await markQueueItemFailed(id, result.reason);
  }
  if (result.ok) revalidatePath("/");
  revalidateAutomationSurfaces();
}

export async function cancelAutomationRunAction(formData: FormData) {
  await requireRole("admin");
  const id = runId(formData);
  if (!id) throw new Error("Automation run missing.");
  await setAutomationRunStatus(id, "CANCELLED", "Cancelled from automation dashboard.");
  revalidateAutomationSurfaces();
  revalidatePath(`/admin/automation/runs/${id}`);
}

export async function retryAutomationRunAction(formData: FormData) {
  await requireRole("admin");
  const id = runId(formData);
  if (!id) throw new Error("Automation run missing.");
  const input = await getAutomationRunRetryInput(id);
  const result = await startAutomationPipeline({ ...input, dryRun: false });
  revalidateAutomationSurfaces();
  revalidatePath(`/admin/automation/runs/${id}`);
  revalidatePath(`/admin/automation/runs/${result.runId}`);
}
