# Autoblog Implementation Plan

## Phase 0: Audit And Integration Map

- Create architecture audit and implementation plan.
- Add `typecheck` script so every future phase can run the required quality gate.
- Preserve existing CMS, public URLs, auth, SEO, sitemap, and media architecture.

## Phase 1: Core Automation Infrastructure

- Extend Mongoose schemas with AutomationRun, AutomationSettings, ProviderSettings, AIUsageRecord, PromptTemplate, AutomationNotification, Keyword, TopicCluster, PublishingQueue, ProviderHealth.
- Add TypeScript types under `src/modules/autoblog/types`.
- Add repositories for settings, runs, prompts, providers, and keywords.
- Every automation run stores stages, error messages, retry count, quality scores, provider usage, and idempotency keys.
- Added site niche profile, editorial profile, SERP snapshots, research sources, GSC performance rows, refresh candidates, SEO experiments, and ROI records.

## Phase 2: Queue And Worker Foundation

- Add BullMQ on top of existing Redis.
- Create queue registry for planning, keyword discovery, SERP research, research, brief, outline, writing, verification, SEO, internal linking, image, plagiarism, quality, publishing, refresh.
- Implement retries, backoff, job deduplication, locks, and dead-letter naming.
- No long-running AI/network work in HTTP requests.

## Phase 3: Provider And AI Layer

- Add Gemini text/image provider configuration and server-only clients.
- Add provider interfaces for keyword data, SERP, plagiarism, GSC, image, trends.
- Add production provider adapters that return typed unavailable/dry-run responses when credentials are missing.
- Track provider health, usage, cost, latency, timeout, and failures.

## Phase 4: Strategy Engines

- Implement keyword normalization, clustering, cannibalization, intent classification, topical map, opportunity score, SERP weakness, information gain, quality gates, GSC striking-distance, CTR opportunity, and decay detection.
- Reuse existing post/category/tag data to avoid duplicate URLs and cannibalization.

## Phase 5: Content Pipeline

- Generate brief, outline, draft article, senior edit pass, claim extraction, fact verification, citations, SEO audit, internal links, media decision, plagiarism, final quality gate.
- Output drafts and review artifacts. Do not publish by default.
- Gemini task execution uses centralized prompt templates and usage logging.

## Phase 6: Publishing Queue

- Add safe publishing queue with exact-once lock/idempotency.
- Publishing transaction updates post status, timestamps, canonicals, internal links, cache, revalidation, sitemap visibility.
- Added exactly-once publisher helper for queue items that refuses to publish without fact, SEO, and media gates.

## Phase 7: Admin Automation UI

- Add `/admin/automation`, settings, pipeline inspector, topic map, calendar, providers, runs, prompts, keywords, publishing queue, notifications.
- RBAC protects settings, providers, budgets, and publishing controls.
- Added final automation settings form for safe mode, budgets, niche profile, editorial profile, scheduling, internal links, image mode, and quality gates.

## Phase 8: Analytics And Learning

- Add Search Console import, query harvesting, striking-distance engine, CTR opportunities, decay radar, refresh pipeline, consolidation/pruning, experiment tracking, ROI.
- Added Search Console provider, GSC metric storage, striking-distance detection, CTR detection, decay detection, refresh candidate storage, experiment log, and ROI records.

## Phase 9: Admin Operations Screens

- Added calendar, publishing queue, provider settings, prompt registry, and per-run pipeline inspector routes.
- Every run can show stages, attempts, errors, notifications, and stored artifacts.

## Phase 10: Webhooks And Stage Artifacts

- Added automation artifact storage for briefs, snapshots, checks, plans, and stage summaries.
- Added Copyleaks webhook endpoint for async plagiarism result handling.
- Worker records stage artifacts and refuses to fabricate provider outputs when credentials are missing.

## Required Quality Gate For Every Phase

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If provider credentials are unavailable, the phase still ships production interfaces, safe config, mock/unavailable adapters, health states, and tests.
