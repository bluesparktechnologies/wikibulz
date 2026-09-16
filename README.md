# WikiBulz Publishing Platform

WikiBulz is a production-oriented Next.js publishing platform focused on crawlability, structured data, performance, editorial workflow, redirects, internal linking, and scalable content operations.

## Stack

- Next.js 16 App Router with TypeScript and Server Components
- React 19
- MongoDB with Mongoose models and production indexes
- Redis for strategic caching, counters, navigation, related posts, redirects, and metadata
- Tailwind CSS 4
- Zod, React Hook Form, JWT sessions, bcrypt-ready password hashing
- TipTap dependencies for an extensible rich editor surface
- Docker and Docker Compose for Next.js, MongoDB, and Redis

## Getting Started

1. Copy `.env.example` to `.env` and set `JWT_SECRET`, `SITE_URL`, `MONGODB_URI`, and `REDIS_URL`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

Without MongoDB or Redis configured, the app renders from bundled development content so SEO pages, sitemaps, redirects, and admin reports can be tested immediately. MongoDB remains the source of truth in production.

## Commands

- `npm run dev` starts local development.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs the TypeScript production safety check.
- `npm run test` runs Vitest utility tests.
- `npm run seed` previews development seed content.
- `npm run migrate` syncs the initial MongoDB indexes.
- `npm run jobs:publish-scheduled` publishes eligible scheduled posts.
- `npm run jobs:cleanup-404s` removes low-value stale 404 records.
- `npm run jobs:autoblog-worker` runs the autonomous SEO queue workers when Redis is configured.
- `npm run validate:seo` checks SEO configuration and redirect invariants.
- `npm run seo:audit` reports duplicate metadata, missing descriptions, missing alt text, orphan candidates, and SEO warnings.

## SEO Architecture

Public pages render meaningful HTML on the server. Articles use clean URLs in the form `/{categorySlug}/{postSlug}` with a URL utility layer that can later switch to `/{postSlug}` without changing the core post model. Metadata is generated through the Next.js Metadata API, with safe fallbacks for titles, descriptions, canonicals, Open Graph, and Twitter cards.

The platform includes Article/BlogPosting/NewsArticle JSON-LD, Organization, WebSite, BreadcrumbList, Person, and optional FAQ schema. Schema is generated only from visible editorial data; it does not fabricate reviewers, credentials, sources, or FAQ content.

## Content Management

The data model supports posts, authors, categories, tags, pages, redirects, users, internal links, media metadata, and tracked 404 URLs. Posts include workflow statuses, SEO metadata, social metadata, E-E-A-T fields, sources, references, FAQs, table of contents, related posts, redirect history, freshness dates, word count, and reading time.

## Advanced Editor

The admin post editor supports featured images, inline content images, image upload, image URLs, media library reuse, image alt text, captions, links, tables, headings, lists, quotes, code blocks, SEO previews, focus and secondary keywords, social metadata, schema settings, source links, FAQ schema, robots controls, canonical URL, freshness fields, content score signals, and redirect-aware slug/category changes.

## Autonomous SEO Engine

The repository includes the production foundation for an autonomous organic-growth workflow under `/admin/automation`. It is dry-run first by default and will not auto-publish unless settings and provider credentials explicitly allow it.

Recommended early-stage setup before the site earns enough for paid plagiarism APIs:

- Publishing Mode: `Save For Review`
- Plagiarism Mode: `LLM Risk Only` or `Manual Check`
- Auto Publish: off
- Fact verification, cannibalization, information gain, and SEO gates: on

When repeated articles pass manual checks and the site is earning, switch to:

- Publishing Mode: `Auto Schedule` or `Direct Publish`
- Plagiarism Mode: `API Required`
- Auto Publish: on only after provider health is green

Implemented phases include:

- Phase 0: architecture audit and implementation plan in `docs/`.
- Phase 1: durable MongoDB automation models, settings, prompt templates, provider health, keywords, clusters, queue, notifications, and indexes.
- Phase 2: Redis/BullMQ queue foundation, idempotent run creation, pipeline stages, and fail-closed provider abstractions.
- Phase 3: Gemini text adapter, structured JSON output validation, keyword normalization, intent classification, opportunity scoring, cannibalization checks, and quality gates.
- Phase 4: admin Automation Control Center, final settings form, provider health refresh, dry-run starter, pipeline/queue visibility, and topic-map view.
- Phase 5: centralized prompt-driven Gemini task service with usage/cost logging.
- Phase 6: production adapters for Google Ads Keyword Planner, DataForSEO SERP snapshots, Google Search Console, Copyleaks, and Gemini image generation.
- Phase 7: exactly-once publishing helper with lock, state checks, quality gates, cache invalidation, and revalidation.
- Phase 8: GSC learning helpers for striking-distance queries, CTR opportunities, content decay, refresh candidates, experiment history, and ROI records.
- Phase 9: admin screens for calendar, publishing queue, providers, prompt registry, and per-run pipeline inspector.
- Phase 10: plagiarism webhook endpoint and AutomationArtifact storage so every stage can keep inspectable outputs/history.

External provider adapters are intentionally credential-gated. Google Ads, DataForSEO, Google Search Console, Copyleaks, and image generation must be configured through environment variables before live data collection, live plagiarism checks, live GSC learning, or automated image generation can run. Without those credentials the system stays safe in dry-run/configuration-required mode and does not fabricate production results.

## Redirects and URL Safety

Middleware normalizes uppercase/trailing slash variations and resolves active redirects. The redirect service detects self-redirects, chains, and loops. Published slug/category changes should create 301 redirects and require editor confirmation showing the old and new URL.

## Caching and Revalidation

Redis is optional and failure-tolerant. Cache keys are namespaced, and `invalidatePost` clears affected post/category/homepage/sitemap keys while triggering Next.js revalidation. MongoDB remains the persistent source of truth.

## Media

The media abstraction validates image type and size, stores dimensions and alt/caption/credit metadata, and is ready for local, Cloudflare R2, S3, or compatible object storage adapters. Public images use Next.js Image with explicit dimensions and AVIF/WebP support.

## Docker

Create `.env`, then run:

```bash
docker compose up --build
```

Services: `nextjs`, `mongodb`, and `redis`.

## Production Notes

Set a strong `JWT_SECRET`, run behind HTTPS, configure CDN caching with explicit HTML revalidation behavior, preserve sitemap freshness, and avoid indexing empty archives or search pages. For VPS deployments behind Nginx, forward `Host`, `X-Forwarded-Proto`, and `X-Forwarded-For`, enable compression, and cache immutable Next.js static assets while keeping HTML responsive to ISR and on-demand revalidation.

## Future Extensions

The repository boundaries are designed so search can move from MongoDB text search to Meilisearch, Typesense, OpenSearch, or Elasticsearch. Programmatic SEO can be added through dedicated template/entity/dataset modules with explicit index controls, canonical management, and editorial quality gates.

## Completion Notes

The implementation includes production-ready modules for public crawlable pages, admin CRUD, DB-backed authentication and RBAC, MongoDB indexes/migrations, Redis-backed cache helpers, safe manual revalidation, media upload and media inventory, redirect management, tracked 404 reporting, URL inspection, SEO exports, schema generation, sitemap splitting, scheduled publishing jobs, and cleanup jobs. Advanced provider adapters such as Cloudflare R2/S3 and external search engines are intentionally abstracted behind service boundaries so they can be enabled with environment-specific credentials rather than hard-coded infrastructure.
