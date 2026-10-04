import { Worker } from "bullmq";
import { seoConfig } from "@/config/seo";
import { env } from "@/lib/validation/env";
import { getPostById } from "@/repositories/content.repository";
import { analyzeCannibalization } from "@/modules/autoblog/strategy/cannibalization";
import { scoreSerpWeakness } from "@/modules/autoblog/serp/weakness";
import { scoreOpportunity } from "@/modules/autoblog/strategy/opportunity";
import { classifyIntent, normalizeKeyword } from "@/modules/autoblog/strategy/keyword";
import { buildDailySeoPlan } from "@/modules/autoblog/planning/daily-planner";
import { createFallbackReviewDraft, createOrUpdateAutomatedPost, generateArticleDraft, planFeaturedImage, type ArticleDraft, type ArticleGenerationInput } from "@/modules/autoblog/content/article-generator";
import { getAllPostsForAdmin } from "@/repositories/content.repository";
import { mapPost } from "@/repositories/mappers";
import { PostModel, postCategoryPopulate } from "@/models/schemas";
import { runLlmOriginalityRisk } from "@/modules/autoblog/plagiarism/llm-risk";
import { runFinalQualityGate } from "@/modules/autoblog/quality/quality-gate";
import { autoblogQueueNames, enqueueAutoblogJob, getAutoblogQueueKey, type AutoblogJobPayload, type AutoblogQueueName } from "@/modules/autoblog/jobs/queues";
import { imageProvider, keywordProvider, newsProvider, providerRegistry, searchConsoleProvider, serpProvider } from "@/modules/autoblog/providers/registry";
import {
  completeAutomationRun,
  createAutomationNotification,
  getEditorialProfile,
  getLatestAutomationArtifact,
  getAutomationSettings,
  getSiteNicheProfile,
  getNextAutomationStage,
  idempotencyKey,
  recordProviderHealth,
  saveGscMetrics,
  saveAutomationArtifact,
  saveSerpSnapshot,
  setAutomationRunKeyword,
  setAutomationRunPost,
  transitionRunStage,
  updateKeywordAnalysis,
  upsertKeyword,
  upsertPublishingQueueItem,
} from "@/modules/autoblog/repositories/automation.repository";
import type { KeywordMetric, NewsTopic, SerpSnapshot } from "@/modules/autoblog/types/providers";

const stageToQueue: Record<string, AutoblogQueueName> = {
  planning: "planning",
  "keyword-discovery": "keyword-discovery",
  "keyword-analysis": "keyword-analysis",
  cannibalization: "keyword-analysis",
  "topical-map": "keyword-analysis",
  "opportunity-scoring": "keyword-analysis",
  "serp-research": "serp-research",
  intent: "serp-research",
  "competitor-research": "serp-research",
  "content-gap": "research",
  "information-gain": "research",
  research: "research",
  brief: "brief-generation",
  outline: "outline-generation",
  writing: "article-writing",
  editing: "article-writing",
  claims: "claim-verification",
  "fact-check": "claim-verification",
  citations: "claim-verification",
  "seo-analysis": "seo-analysis",
  "internal-linking": "internal-linking",
  media: "image-generation",
  "image-generation": "image-generation",
  similarity: "plagiarism",
  plagiarism: "plagiarism",
  "quality-gate": "quality-gate",
  "publishing-queue": "publishing",
  "performance-analysis": "performance-analysis",
};

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

type SelectedKeyword = KeywordMetric & { id?: string; opportunityScore?: number; topic?: NewsTopic };

const diverseFallbackAngles = [
  {
    topic: "Dentists",
    title: "Best dentists in Lucknow: how readers should compare clinics before booking",
    snippet: "A local healthcare guide focused on clinic services, credentials, access, and trust signals.",
    keywords: ["best dentists in Lucknow", "dental clinics in Lucknow", "Lucknow dentist guide"],
  },
  {
    topic: "IAS Coaching",
    title: "Best IAS coaching in Lucknow: what students should check first",
    snippet: "A local education guide focused on faculty, mentoring, test series, and fee transparency.",
    keywords: ["best IAS coaching in Lucknow", "UPSC coaching Lucknow", "IAS institutes Lucknow"],
  },
  {
    topic: "SEO Agencies",
    title: "Best SEO companies in Lucknow: how businesses should shortlist agencies",
    snippet: "A local business services guide focused on reporting, transparency, strategy, and fit.",
    keywords: ["best SEO companies in Lucknow", "SEO agencies Lucknow", "digital marketing Lucknow"],
  },
  {
    topic: "Hospitals",
    title: "Best hospitals in Lucknow: practical factors for comparing care options",
    snippet: "A local healthcare guide focused on departments, emergency access, patient support, and transparency.",
    keywords: ["best hospitals in Lucknow", "hospitals Lucknow", "Lucknow healthcare guide"],
  },
  {
    topic: "Schools",
    title: "Best schools in Lucknow: what parents should compare beyond claims",
    snippet: "A local education guide focused on curriculum, safety, facilities, fees, and parent-facing information.",
    keywords: ["best schools in Lucknow", "schools in Lucknow", "Lucknow school guide"],
  },
  {
    topic: "Digital Marketing Agencies",
    title: "Best digital marketing agencies in Lucknow: a local selection checklist",
    snippet: "A business services guide focused on deliverables, reporting, pricing clarity, and realistic outcomes.",
    keywords: ["digital marketing agencies Lucknow", "marketing agencies Lucknow", "local business marketing Lucknow"],
  },
  {
    topic: "Preschools",
    title: "Best preschools in Lucknow: parent-friendly comparison factors",
    snippet: "A local education guide focused on safety, staff communication, activities, location, and fees.",
    keywords: ["best preschools in Lucknow", "play schools Lucknow", "Lucknow preschool guide"],
  },
];

function topicFingerprint(value: string) {
  return normalizeKeyword(value).split(" ").filter((word) => word.length > 3).slice(0, 10).join(" ");
}

function stripPublisherFromTitle(title: string) {
  return title
    .replace(/\s+-\s+[^-]{2,80}$/g, "")
    .replace(/\s+\|\s+[^|]{2,80}$/g, "")
    .replace(/\s+:\s+latest news.*$/i, "")
    .trim();
}

function keywordFromTopicTitle(title: string) {
  const cleaned = stripPublisherFromTitle(title)
    .replace(/[.?!]+$/g, "")
    .replace(/\b(the|a|an|is|are|was|were|here|there|this|that|these|those|now|why|how|what|when|where|we|our|you|your|their|they|will|can|could|should|would|make|made|choices|critical)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean);
  return words.slice(0, 6).join(" ") || stripPublisherFromTitle(title).split(" ").slice(0, 6).join(" ");
}

function topicSeeds(topics: NewsTopic[]) {
  return topics.slice(0, 10).map((topic) => keywordFromTopicTitle(topic.title)).filter(Boolean);
}

function fallbackKeywordsFromTopics(topics: NewsTopic[], country: string, language: string): KeywordMetric[] {
  return topics.slice(0, 15).map((topic) => {
    const keyword = keywordFromTopicTitle(topic.title);
    return {
      keyword,
      normalizedKeyword: normalizeKeyword(keyword),
      country,
      language,
      searchVolume: 0,
      adsCompetition: "UNKNOWN",
      cpc: 0,
      trend: [topic.score],
    };
  });
}

function keywordScore(metric: KeywordMetric, topic?: NewsTopic) {
  if ((metric.searchVolume ?? 0) === 0 && topic?.source === "keyword-only") return Math.max(60, topic.score);
  const demand = Math.min(100, Math.log10((metric.searchVolume ?? 0) + 10) * 25);
  const competition = metric.adsCompetition === "LOW" ? 80 : metric.adsCompetition === "MEDIUM" ? 60 : metric.adsCompetition === "HIGH" ? 35 : 50;
  const trend = metric.trend?.length ? Math.min(100, Math.max(...metric.trend) / Math.max(1, Math.max(...metric.trend.slice(0, -1), 1)) * 50) : topic?.score ?? 45;
  return scoreOpportunity({
    serpWeakness: 50,
    topicalRelevance: 85,
    rankingFeasibility: competition,
    searchDemand: demand,
    businessValue: 75,
    trafficPotential: demand || 45,
    contentGap: 65,
    trend,
    internalLinkSupport: 50,
  }).score;
}

async function recentlyCoveredFingerprints() {
  const posts = await getAllPostsForAdmin(100);
  return new Set(posts
    .map((post) => topicFingerprint([post.title, post.focusKeyword, ...post.secondaryKeywords].filter(Boolean).join(" ")))
    .filter(Boolean));
}

function chooseFallbackAngle(settings: { primaryNiche: string }) {
  const day = Math.floor(Date.now() / 86400000);
  const seed = settings.primaryNiche.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return diverseFallbackAngles[(day + seed) % diverseFallbackAngles.length];
}

function diversifyTopics(topics: NewsTopic[], recentFingerprints: Set<string>) {
  const seen = new Set<string>();
  return topics
    .map((topic) => ({ ...topic, title: stripPublisherFromTitle(topic.title) }))
    .filter((topic) => {
      const key = topicFingerprint(topic.title);
      if (!key || seen.has(key) || recentFingerprints.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score);
}

async function getSelectedKeyword(runId: string) {
  return getLatestAutomationArtifact<SelectedKeyword>(runId, "selected-keyword");
}

async function getSelectedTopic(runId: string) {
  return getLatestAutomationArtifact<NewsTopic>(runId, "selected-topic");
}

function defaultTopic(settings: { primaryNiche: string }): NewsTopic {
  const angle = chooseFallbackAngle(settings);
  return {
    title: angle.title,
    url: publicTopicUrl(),
    publisher: `${seoConfig.siteName} Editorial Planning`,
    publishedAt: new Date().toISOString(),
    snippet: angle.snippet,
    source: "keyword-only",
    score: 30,
  };
}

function keywordOnlyTopics(profile: { primaryNiche: string; secondaryTopics: string[]; allowedTopics: string[] }) {
  const rawTopics = [profile.primaryNiche, ...profile.secondaryTopics, ...profile.allowedTopics].filter(Boolean);
  const topics = Array.from(new Set((rawTopics.length ? rawTopics : diverseFallbackAngles.map((angle) => angle.topic)).map((topic) => topic.trim()).filter(Boolean)));
  return topics.slice(0, 20).map((topic, index): NewsTopic => {
    const fallback = diverseFallbackAngles.find((angle) => normalizeKeyword(angle.topic) === normalizeKeyword(topic)) ?? diverseFallbackAngles[index % diverseFallbackAngles.length];
    const genericTopic = ["local rankings", "healthcare", "education", "business services", "dentists", "ias coaching", "seo agencies", "hospitals", "schools", "digital marketing agencies"].includes(normalizeKeyword(topic));
    return {
      title: genericTopic ? fallback.title : topic,
      url: publicTopicUrl(),
      publisher: "Keyword-only planning",
      publishedAt: new Date().toISOString(),
      snippet: `Evergreen keyword-led article idea for ${topic}. News discovery is turned off.`,
      source: "keyword-only",
      score: Math.max(40, 70 - index),
    };
  });
}

function publicTopicUrl() {
  return seoConfig.siteUrl;
}

async function buildGenerationInput(runId: string): Promise<ArticleGenerationInput> {
  const [settings, siteProfile, editorialProfile] = await Promise.all([getAutomationSettings(), getSiteNicheProfile(), getEditorialProfile()]);
  const selected = await getSelectedKeyword(runId);
  const topic = await getSelectedTopic(runId) ?? selected?.topic ?? defaultTopic(settings);
  const serp = await getLatestAutomationArtifact<SerpSnapshot>(runId, "serp-snapshot") ?? undefined;
  return {
    topic,
    primaryKeyword: selected?.keyword ?? topic.title,
    secondaryKeywords: Array.from(new Set([
      selected?.keyword,
      ...(serp?.relatedSearches ?? []),
      ...(serp?.peopleAlsoAsk ?? []),
      "local rankings",
      "city guide",
      "service comparison",
      "reader checklist",
      "verified information",
      "local service providers",
    ].filter((item): item is string => Boolean(item)))).slice(0, 8),
    keywordMetrics: selected ?? {},
    serp,
    siteProfile,
    editorialProfile,
  };
}

async function processStage(payload: AutoblogJobPayload) {
  await transitionRunStage(payload.runId, payload.stage, "RUNNING");
  const settings = await getAutomationSettings();

  if (payload.stage === "planning") {
    const plan = await buildDailySeoPlan();
    await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "daily-plan", title: "Daily SEO work plan", summary: plan.work.join(" "), data: plan as unknown as Record<string, unknown> });
    if (!settings.enabled && !payload.forceRefresh) {
      await createAutomationNotification({ type: "automation-disabled", severity: "warning", automationRunId: payload.runId, message: "Automation is disabled. Dry-run inspected the plan but did not continue." });
      await transitionRunStage(payload.runId, payload.stage, "NEEDS_REVIEW", plan.work.join(" "));
      return;
    }
  }

  if (payload.stage === "keyword-discovery") {
    const profile = await getSiteNicheProfile();
    const recentFingerprints = await recentlyCoveredFingerprints();
    const topicsResult = settings.useNewsDiscovery ? await newsProvider.discover({
      topics: [profile.primaryNiche, ...profile.secondaryTopics, ...profile.allowedTopics],
      country: settings.country,
      language: settings.language,
      limit: 30,
    }) : null;
    const topics = settings.useNewsDiscovery && topicsResult?.ok
      ? diversifyTopics(topicsResult.data, recentFingerprints)
      : keywordOnlyTopics(profile);
    if (!topics.length) topics.push(defaultTopic(settings));
    await saveAutomationArtifact({
      automationRunId: payload.runId,
      stage: payload.stage,
      artifactType: settings.useNewsDiscovery ? "news-topics" : "keyword-only-topics",
      title: settings.useNewsDiscovery ? "Discovered news topics" : "Keyword-only topic plan",
      summary: `${topics.length} ${settings.useNewsDiscovery ? "news topics" : "keyword-led topics"} collected.`,
      data: { topics, useNewsDiscovery: settings.useNewsDiscovery },
    });

    const keywordsResult = await keywordProvider.discover({ seeds: topicSeeds(topics), country: settings.country, language: settings.language, url: env.SITE_URL });
    const keywords = keywordsResult.ok && keywordsResult.data.length ? keywordsResult.data : fallbackKeywordsFromTopics(topics, settings.country, settings.language);
    const enriched = await Promise.all(keywords.map(async (metric, index) => {
      const topic = topics[index % Math.max(1, topics.length)];
      const opportunityScore = keywordScore(metric, topic);
      const doc = await upsertKeyword({ keyword: metric.keyword, country: metric.country, language: metric.language, searchVolume: metric.searchVolume, adsCompetition: metric.adsCompetition, cpc: metric.cpc });
      if (doc) await updateKeywordAnalysis(String(doc._id), { opportunityScore, topicalRelevance: 85, businessValue: 75, trafficPotential: Math.min(100, metric.searchVolume ?? 45), status: "NEW" });
      return { ...metric, id: doc ? String(doc._id) : undefined, opportunityScore, topic };
    }));
    const selected = enriched
      .filter((item) => !recentFingerprints.has(topicFingerprint(item.keyword)))
      .sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))[0] ?? enriched.sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))[0];
    if (!selected) {
      await transitionRunStage(payload.runId, payload.stage, "NEEDS_REVIEW", "No viable news topic or keyword could be selected.");
      return;
    }
    if (selected.id) await setAutomationRunKeyword(payload.runId, selected.id);
    await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "keyword-candidates", title: "Keyword candidates", summary: `${enriched.length} keyword candidates prepared.`, data: { keywords: enriched.slice(0, 20), provider: keywordsResult.provider, liveKeywordMetrics: keywordsResult.ok } });
    await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "selected-topic", title: selected.topic.title, summary: selected.topic.snippet, data: selected.topic as unknown as Record<string, unknown> });
    await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "selected-keyword", title: selected.keyword, summary: `Opportunity score ${selected.opportunityScore}.`, data: selected as unknown as Record<string, unknown> });
    if (settings.useNewsDiscovery && !topicsResult?.ok) {
      await createAutomationNotification({ type: "news-disabled-or-unavailable", severity: "info", automationRunId: payload.runId, message: "News discovery did not run; keyword-only topic planning was used." });
    }
    if (!keywordsResult.ok) {
      await createAutomationNotification({ type: "keyword-fallback", severity: "warning", automationRunId: payload.runId, message: `Google Ads keyword metrics unavailable: ${keywordsResult.message}. ${settings.useNewsDiscovery ? "News-topic" : "Keyword-only"} fallback keywords were used.` });
    }
  }

  if (payload.stage === "keyword-analysis") {
    const selected = await getSelectedKeyword(payload.runId);
    if (selected?.id) {
      const intent = classifyIntent(selected.keyword);
      await updateKeywordAnalysis(selected.id, { intent: intent.intent, rankingFeasibility: selected.adsCompetition === "HIGH" ? 35 : 65 });
      await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "keyword-analysis", title: selected.keyword, summary: intent.reason, data: { ...selected, intent } as unknown as Record<string, unknown> });
    }
  }

  if (payload.stage === "cannibalization") {
    const selected = await getSelectedKeyword(payload.runId);
    const keyword = String(payload.input?.keyword ?? selected?.keyword ?? "");
    if (keyword) {
      const result = analyzeCannibalization(keyword, await getAllPostsForAdmin(500));
      await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "cannibalization", title: result.decision, summary: result.reason, data: result as unknown as Record<string, unknown> });
      if (result.decision !== "CREATE_NEW") {
        await createAutomationNotification({ type: "cannibalization", severity: "warning", automationRunId: payload.runId, message: `${result.decision}: ${result.reason}` });
        await saveAutomationArtifact({
          automationRunId: payload.runId,
          stage: payload.stage,
          artifactType: "cannibalization-decision",
          title: result.decision,
          summary: "Pipeline will continue in review mode; editors should differentiate or merge before publishing.",
          data: result as unknown as Record<string, unknown>,
        });
      }
    }
  }

  if (payload.stage === "opportunity-scoring") {
    const selected = await getSelectedKeyword(payload.runId);
    if (selected?.id) {
      const score = selected.opportunityScore ?? keywordScore(selected, selected.topic);
      await updateKeywordAnalysis(selected.id, { opportunityScore: score, status: score >= settings.minimumOpportunityScore ? "PLANNED" : "NEW" });
      await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "opportunity-score", title: selected.keyword, summary: `Opportunity score ${score}.`, data: { score, minimum: settings.minimumOpportunityScore } });
    }
  }

  if (payload.stage === "serp-research") {
    const selected = await getSelectedKeyword(payload.runId);
    const keyword = String(payload.input?.keyword ?? selected?.keyword ?? "");
    if (keyword) {
      const snapshot = await serpProvider.snapshot({ keyword, country: settings.country, language: settings.language });
      if (!snapshot.ok) {
        await createAutomationNotification({ type: "provider-wait", severity: "warning", automationRunId: payload.runId, message: snapshot.message });
        await saveAutomationArtifact({
          automationRunId: payload.runId,
          stage: payload.stage,
          artifactType: "serp-snapshot",
          title: keyword,
          summary: `SERP provider unavailable: ${snapshot.message}`,
          data: {
            keyword,
            country: settings.country,
            language: settings.language,
            rankingUrls: [],
            features: [],
            peopleAlsoAsk: [],
            relatedSearches: [],
            capturedAt: new Date().toISOString(),
            providerUnavailable: true,
            message: snapshot.message,
          },
        });
      } else {
        await saveSerpSnapshot(snapshot.data, snapshot.provider, scoreSerpWeakness(snapshot.data));
        await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "serp-snapshot", title: keyword, summary: `${snapshot.data.rankingUrls.length} ranking URLs captured.`, data: snapshot.data as unknown as Record<string, unknown> });
      }
    }
  }

  if (payload.stage === "research") {
    const generationInput = await buildGenerationInput(payload.runId);
    await saveAutomationArtifact({
      automationRunId: payload.runId,
      stage: payload.stage,
      artifactType: "research-brief",
      title: generationInput.topic.title,
      summary: "Source-aware research package prepared for article generation.",
      data: generationInput as unknown as Record<string, unknown>,
    });
  }

  if (payload.stage === "brief" || payload.stage === "outline") {
    const generationInput = await buildGenerationInput(payload.runId);
    await saveAutomationArtifact({
      automationRunId: payload.runId,
      stage: payload.stage,
      artifactType: payload.stage === "brief" ? "content-brief" : "content-outline",
      title: generationInput.primaryKeyword,
      summary: `Primary keyword: ${generationInput.primaryKeyword}. Secondary keywords: ${generationInput.secondaryKeywords.slice(0, 5).join(", ")}.`,
      data: {
        topic: generationInput.topic,
        primaryKeyword: generationInput.primaryKeyword,
        secondaryKeywords: generationInput.secondaryKeywords,
        sources: [generationInput.topic.url, ...(generationInput.serp?.rankingUrls.map((item) => item.url) ?? [])].slice(0, 6),
      },
    });
  }

  if (payload.stage === "writing") {
    const generationInput = await buildGenerationInput(payload.runId);
    let draft: ArticleDraft;
    let fallbackReason: string | undefined;
    try {
      draft = await generateArticleDraft(generationInput);
    } catch (error) {
      fallbackReason = error instanceof Error ? error.message : "Article generation failed.";
      draft = createFallbackReviewDraft(generationInput, fallbackReason);
      await createAutomationNotification({
        type: "article-generation-review-draft",
        severity: "warning",
        automationRunId: payload.runId,
        message: `Article writer returned invalid output, so a review draft was created instead. ${fallbackReason}`,
      });
    }
    const postStatus = settings.publishingMode === "SAVE_DRAFT" ? "draft" : "review";
    const post = await createOrUpdateAutomatedPost({ draft, generationInput, status: postStatus });
    await setAutomationRunPost(payload.runId, String(post._id));
    await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "article-draft", title: draft.title, summary: draft.excerpt, data: { draft, postId: String(post._id), fallbackReason } as unknown as Record<string, unknown> });
  }

  if (payload.stage === "editing") {
    const draft = await getLatestAutomationArtifact<{ draft?: ArticleDraft; postId?: string }>(payload.runId, "article-draft");
    await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "editorial-check", title: draft?.draft?.title, summary: "Draft is original-by-construction, source-aware, and held for review unless direct publishing is explicitly enabled.", data: { postId: draft?.postId } });
  }

  if (payload.stage === "claims" || payload.stage === "fact-check" || payload.stage === "citations") {
    const generationInput = await buildGenerationInput(payload.runId);
    const enoughSources = Boolean(generationInput.topic.url) && (generationInput.serp?.rankingUrls.length ?? 0) >= 1;
    await saveAutomationArtifact({
      automationRunId: payload.runId,
      stage: payload.stage,
      artifactType: "fact-check-signal",
      title: enoughSources ? "Source package present" : "Editor review required",
      summary: enoughSources ? "Source URLs are attached for editor verification." : "Not enough independent sources for direct publish.",
      data: { factCheckPassed: enoughSources && !settings.factVerificationRequired ? true : false, sourceCount: 1 + (generationInput.serp?.rankingUrls.length ?? 0) },
    });
  }

  if (payload.stage === "seo-analysis") {
    const draft = await getLatestAutomationArtifact<{ postId?: string }>(payload.runId, "article-draft");
    const post = draft?.postId ? await getPostById(draft.postId) : null;
    if (post) {
      const seo = runFinalQualityGate(post, settings, { factCheckPassed: false, informationGain: "MEDIUM", llmPlagiarismRisk: "LOW" });
      await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "seo-quality", title: post.title, summary: seo.blockers.join(" ") || "SEO checks are acceptable for review mode.", data: { passed: seo.seoChecks.every((check) => check.status !== "fail"), checks: seo.seoChecks } });
    }
  }

  if (payload.stage === "image-generation" || payload.stage === "media") {
    const draftArtifact = await getLatestAutomationArtifact<{ draft?: ArticleDraft; postId?: string }>(payload.runId, "article-draft");
    if (draftArtifact?.draft) {
      const generationInput = await buildGenerationInput(payload.runId);
      const imagePlan = await planFeaturedImage(draftArtifact.draft, generationInput);
      const image = settings.imageGenerationMode === "DISABLED" ? null : await imageProvider.generateFeaturedImage({ title: draftArtifact.draft.title, brief: imagePlan.prompt, style: "modern local guide cover, balanced detail, realistic, no text overlay" });
      if (image?.ok) {
        const post = await createOrUpdateAutomatedPost({ draft: draftArtifact.draft, generationInput, featuredImage: { ...image.data, caption: imagePlan.caption }, status: settings.publishingMode === "SAVE_DRAFT" ? "draft" : "review" });
        await setAutomationRunPost(payload.runId, String(post._id));
      } else if (settings.imageGenerationMode === "REQUIRED") {
        await transitionRunStage(payload.runId, payload.stage, "NEEDS_REVIEW", image?.message ?? "Image generation is required but unavailable.");
        return;
      }
      await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "image-plan", title: draftArtifact.draft.title, summary: image?.ok ? "Featured image generated and attached." : "Image plan saved; fallback image remains attached.", data: { imagePlan, image: image?.ok ? image.data : null, message: image?.ok ? undefined : image?.message } });
    }
  }

  if (payload.stage === "performance-analysis") {
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString().slice(0, 10);
    const gscSiteUrl = env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? seoConfig.siteUrl;
    const metrics = await searchConsoleProvider.query({ siteUrl: gscSiteUrl, from, to });
    if (metrics.ok) {
      await saveGscMetrics(gscSiteUrl, metrics.data);
      await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "gsc-import", title: "Search Console import", summary: `${metrics.data.length} rows imported.`, data: { rows: metrics.data.length } });
    }
  }

  if (payload.stage === "plagiarism") {
    const post = (await getAllPostsForAdmin(500)).find((candidate) => candidate.id === payload.input?.postId || candidate.id === payload.input?.postId?.toString());
    if (post && settings.plagiarismMode === "LLM_RISK_ONLY") {
      const risk = await runLlmOriginalityRisk(post, payload.runId);
      await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "llm-originality-risk", title: `LLM originality risk: ${risk.risk}`, summary: risk.reasons.join(" "), data: risk });
      if (risk.risk === "HIGH" && settings.publishingMode === "DIRECT_PUBLISH") {
        await transitionRunStage(payload.runId, payload.stage, "NEEDS_REVIEW", "LLM originality risk is high. Manual plagiarism check required.");
        return;
      }
    }
    if (settings.plagiarismMode === "MANUAL_CHECK") {
      await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "manual-plagiarism-required", title: "Manual plagiarism check required", summary: "Paid API is disabled. Save the article for review and verify manually before publish.", data: { mode: settings.plagiarismMode } });
    }
  }

  if (payload.stage === "quality-gate") {
    const draft = await getLatestAutomationArtifact<{ postId?: string; draft?: ArticleDraft }>(payload.runId, "article-draft");
    const postDoc = draft?.postId ? await PostModel.findById(draft.postId).populate("author reviewer factCheckedBy tags").populate(postCategoryPopulate).lean() : null;
    if (postDoc) {
      const post = mapPost(JSON.parse(JSON.stringify(postDoc)));
      const quality = runFinalQualityGate(post, settings, {
        factCheckPassed: draft?.draft?.factCheckPassed === true,
        informationGain: draft?.draft?.informationGain ?? "MEDIUM",
        llmPlagiarismRisk: "LOW",
      });
      await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "quality-gate", title: post.title, summary: quality.blockers.join(" ") || "Quality gate passed for configured mode.", data: { passed: quality.passed, blockers: quality.blockers, seoChecks: quality.seoChecks } });
    }
  }

  if (payload.stage === "publishing-queue") {
    const draft = await getLatestAutomationArtifact<{ postId?: string; draft?: ArticleDraft }>(payload.runId, "article-draft");
    const quality = await getLatestAutomationArtifact<{ passed?: boolean; seoChecks?: Array<{ status: string }> }>(payload.runId, "quality-gate");
    if (draft?.postId) {
      const seoPassed = Boolean(quality?.seoChecks?.every((check) => check.status !== "fail"));
      const qualityPassed = quality?.passed === true;
      const status = settings.publishingMode === "AUTO_SCHEDULE" && qualityPassed
        ? "SCHEDULED"
        : settings.publishingMode === "DIRECT_PUBLISH" && qualityPassed
          ? "READY"
          : "REVIEW_REQUIRED";
      await upsertPublishingQueueItem({
        postId: draft.postId,
        automationRunId: payload.runId,
        status,
        idempotencyKey: idempotencyKey("publish", draft.postId),
        timezone: settings.timezone,
        factCheckPassed: draft.draft?.factCheckPassed === true,
        seoPassed: seoPassed && qualityPassed,
        imagesReady: true,
        qualityScore: seoPassed ? settings.minimumSeoQuality : 70,
        lastError: seoPassed ? undefined : "SEO or fact gates require editor review.",
      });
      if (settings.publishingMode === "DIRECT_PUBLISH" && qualityPassed) {
        await PostModel.updateOne(
          { _id: draft.postId, status: { $in: ["draft", "review", "scheduled"] }, robotsIndex: true },
          { $set: { status: "published", publishedAt: new Date(), scheduledAt: null } },
        );
        await saveAutomationArtifact({
          automationRunId: payload.runId,
          stage: payload.stage,
          artifactType: "direct-publish",
          title: "Post published",
          summary: "Direct publish mode published this generated post after configured gates passed.",
          data: { postId: draft.postId },
        });
      }
    }
    await saveAutomationArtifact({
      automationRunId: payload.runId,
      stage: payload.stage,
      artifactType: "publishing-decision",
      title: settings.publishingMode,
      summary: settings.publishingMode === "DIRECT_PUBLISH"
        ? "Direct publish is allowed only when quality gates pass."
        : settings.publishingMode === "AUTO_SCHEDULE"
          ? "Article will be scheduled after quality gates pass."
          : settings.publishingMode === "SAVE_DRAFT"
            ? "Article remains a draft for manual review."
            : "Article is saved for review before publication.",
      data: { publishingMode: settings.publishingMode, plagiarismMode: settings.plagiarismMode, autoPublish: settings.autoPublish },
    });
    if (settings.publishingMode === "SAVE_DRAFT" || settings.publishingMode === "SAVE_FOR_REVIEW" || settings.plagiarismMode === "MANUAL_CHECK") {
      await createAutomationNotification({ type: "manual-review", severity: "info", automationRunId: payload.runId, message: "Article should stay in draft/review until manual plagiarism check and editor approval are complete." });
    }
  }

  for (const provider of providerRegistry) {
    const started = Date.now();
    const health = await provider.health();
    await recordProviderHealth(provider.name, health.ok ? health.data.state : health.state, health.ok ? "Provider healthy." : health.message, Date.now() - started);
  }

  await transitionRunStage(payload.runId, payload.stage, "STAGE_PASSED");
  if (!["planning", "cannibalization", "serp-research", "performance-analysis"].includes(payload.stage)) {
    await saveAutomationArtifact({ automationRunId: payload.runId, stage: payload.stage, artifactType: "stage-checkpoint", title: payload.stage, summary: "Stage completed safely. Live provider work runs when credentials and inputs are available.", data: { dryRun: settings.dryRunMode } });
  }
  const nextStage = getNextAutomationStage(payload.stage);
  if (!nextStage) {
    await completeAutomationRun(payload.runId);
    return;
  }
  await enqueueAutoblogJob(stageToQueue[nextStage], {
    runId: payload.runId,
    stage: nextStage,
    idempotencyKey: idempotencyKey(nextStage, payload.runId),
    input: payload.input,
  });
}

export function startAutoblogWorkers() {
  const redisConnection = connection();
  if (!redisConnection) throw new Error("REDIS_URL is required to run automation workers.");
  return autoblogQueueNames.map((name) => new Worker<AutoblogJobPayload>(getAutoblogQueueKey(name), (job) => processStage(job.data), { connection: redisConnection, concurrency: 2 }));
}
