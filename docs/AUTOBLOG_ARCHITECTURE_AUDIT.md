# Autoblog Architecture Audit

## Existing Reusable Architecture

- **Application stack:** Next.js App Router, TypeScript, MongoDB/Mongoose, optional Redis, Tailwind, server actions, API routes, Docker.
- **Post model:** Rich editorial/SEO surface already exists: title, slug, excerpt, HTML content, featured image, author, reviewer, fact checker, category, tags, status, publish/schedule dates, SEO title, meta description, canonical, robots, focus/secondary keywords, OG/Twitter metadata, schema type, featured/editor pick flags, reading time, word count, TOC, related/manual internal links, sources, references, FAQs, freshness/review fields, redirect history.
- **Author model:** Name, slug, email, bio, avatar, job title, expertise, credentials, social links, website, active status.
- **Category model:** Name, slug, description, SEO title, meta description, canonical, index/noindex, parent category, featured image.
- **Tag model:** Name, slug, description, index/noindex.
- **SEO implementation:** Metadata API covers title, description, canonical, robots, Open Graph, Twitter. Article pages emit Article/BlogPosting/NewsArticle, BreadcrumbList, FAQPage, Organization, and author/trust signals.
- **Sitemap/robots:** Sitemap index plus separate post/category/author sitemaps. Robots points to the sitemap and blocks admin/internal API paths.
- **Redirects:** Admin redirect manager, redirect validation, and automatic 301 creation when a published URL changes.
- **Internal linking:** Suggested internal links, manual internal link storage, orphan detection, related post logic.
- **Caching/Redis:** Optional Redis wrapper; public data fetches use safe cache helpers and degrade when Redis is not configured.
- **Admin architecture:** Sidebar-driven admin app with posts, categories, tags, authors, pages, media, SEO dashboard, redirects, 404s, technical controls, users.
- **Auth/RBAC:** JWT cookie session, bcrypt password hashing, role guard with admin/editor/seo/author levels.
- **Media pipeline:** Upload API validates image files, optimizes to WebP with Sharp, stores local media metadata, supports featured and body images.
- **Scheduler:** Script exists for scheduled publishing; technical admin supports manual revalidation and cache invalidation.

## Missing For Autonomous Organic Growth

- Automation run/state machine, idempotent stages, provider usage records, prompt templates, notifications, and settings.
- Durable queue layer with retries/backoff/dead-letter handling and Redis locks.
- Central Gemini text/image provider layer with safe server-only credentials, structured output validation, usage/cost tracking, timeouts, and provider health.
- Provider abstractions for keyword data, SERP, plagiarism, Google Search Console, trends, and image generation.
- Keyword database, clustering, topical map, cannibalization checks, SERP weakness, intent classification, opportunity scoring.
- Research source database, content briefs, outlines, claim extraction, fact checking, plagiarism checks, quality gates.
- Publishing queue with exactly-once behavior and safe dry-run defaults.
- Automation dashboard, settings, topic map, pipeline inspector, calendar, provider health, cost controls.
- Performance feedback loop using GSC data, refresh candidates, CTR experiments, consolidation/pruning, ROI.

## Integration Points

- **Existing content models** remain source of truth for public posts. Automation should create drafts or publishing queue items, not bypass post workflows.
- **Existing admin shell** should be extended with an Automation section instead of replacing the CMS.
- **Existing Redis client** should back BullMQ queues and locks, while MongoDB remains durable truth.
- **Existing SEO analysis** should be reused as deterministic checks inside quality gates.
- **Existing media upload pipeline** should be reused by image providers after image generation.
- **Existing scheduled publishing script** should be upgraded to exactly-once publishing semantics.

## Safety Boundaries

- Default automation must be `dryRunMode=true` and `autoPublish=false`.
- Missing critical providers must move runs to waiting states, not bypass verification.
- Generated HTML must pass the existing sanitizer before it becomes a post.
- Provider credentials must remain server-only.
- No fake authors, fake citations, fake freshness, AI detector bypass, spinning, cloaking, doorway pages, or mass low-quality publishing.
