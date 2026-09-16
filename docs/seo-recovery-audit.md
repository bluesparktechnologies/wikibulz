# WikiBulz SEO Recovery Audit

Audit date: 2026-09-07

## Scope and evidence

The repository is configured for the WikiBulz production host `wikibulz.com` and `www.wikibulz.com`; local development uses `http://localhost:3002`.

The primary historical source was the Internet Archive CDX index using:

The archive notes below are retained as historical source material and are not part of the WikiBulz production identity.

Any historical search-engine observations are retained only for provenance; WikiBulz uses its own canonical host and content identity.

## Historical URL families found

The archive shows several distinct eras:

### Original IT/news and technical structure

- `/`
- `/?format=feed&type=rss`
- `/?format=feed&type=atom`
- `/?start=4`, `/?start=8`, `/?start=12`, `/?start=16`, `/?start=20`, `/?start=24`, `/?start=28`
- `/articles-archive`
- `/articles-archive/...`
- `/category/technology/`
- `/category/technology/page/2/`
- `/category/blog/`
- `/category/invention/`
- `/category/science/`
- `/category/informative/`
- `/author/admin/`, `/author/admin/page/2/`, `/author/admin/page/3/`
- `/author/akash/`, `/author/akash/page/2/`
- `/author/shoaib/`
- `/author/umar/`, `/author/umar/page/2/`
- `/2022/`, `/2022/06/`, `/2022/07/`, `/2022/09/`, `/2022/09/page/2/` through `/page/5/`
- `/2023/`, `/2023/01/`, `/2023/02/`, `/2023/03/`, `/2023/04/`, `/2023/05/`, `/2023/07/`, `/2023/08/`, `/2023/11/`
- `/2024/01/`, `/2025/03/`

Representative technical articles include:

- `/articles-archive/63-ustanovka-vnc-na-centos-server-poshagovaya-instruktsiya`
- `/articles-archive/64-podklyuchenie-k-vnc-serveru-s-pomoshchyu-vnc-klienta-v-linux`
- `/15-ways-to-leverage-ai-in-customer-service/`
- `/business-tradelines-that-build-your-business-credit/`

The last two examples are not sufficient evidence of a clean original editorial corpus; they require content and backlink validation before migration.

### Likely compromised or unrelated SEO URLs

The archive also contains large groups of unrelated pages about casinos, gambling bonuses, dating, essay-writing services, loans, moving services, pickleball, fertility, and foreign-language hosting directories. Examples include:

- `/best-online-casino-real-money/`
- `/azur-casino-100-free-spins/`
- `/17-finest-one-night-stay-web-sites-free-to-take-to/`
- `/best-research-paper-writing-service-provider/`
- `/payday-loans-near-me/`
- `/katalog-khostinga-vds/...`

These historical URLs should not be restored or redirected without proof that they belong to WikiBulz. They should remain unmapped until Search Console or backlink data proves otherwise.

## Current implementation findings

- Current public article routes are `/<category>/<slug>`.
- Category routes are `/category/<slug>`.
- Current redirect records are stored in MongoDB, but the single-segment public route did not consult them.
- Article redirects were compared without normalized paths.
- Posts did not have a dedicated short public identifier in the content model.
- `SITE_URL` is localhost in the current environment, so production canonicals and sitemap links must be verified after the production environment sets the real host.
- Sitemap index, category sitemap, author sitemap, post sitemap, robots, canonical metadata, Open Graph, Twitter metadata, breadcrumbs, article schema, and FAQ schema are already present in the application.

## Recovery decisions

| Historical family | Decision |
|---|---|
| Confirmed old article with recovered equivalent content | Add a direct 301 in the Redirect collection to the matching canonical article URL. |
| Old category/archive/author URL with a current equivalent | Add a direct 301 only after confirming the destination has the same intent. |
| Old pagination URL | Preserve or redirect to the matching archive/category page after checking whether the page has unique content. |
| Feed URL | Restore an RSS/Atom endpoint only if the old feed is still referenced or backlinks justify it. |
| Unrelated casino, gambling, dating, loan, essay, and hosting-directory URLs | Do not map them to unrelated technology pages. Validate in Search Console first; use 410/noindex handling only after ownership and backlink review. |
| Unknown historical URL | Track as a 404 and review from the admin 404 report. |

## URL migration implemented

New and edited posts can now use:

`/<category>/<short-seo-slug>-<short-public-id>`

The public ID is stable, generated once, and does not expose the MongoDB UUID. Existing posts without a public ID keep their current URL, so this change does not create an automatic migration event. When an existing post is edited, its public ID is preserved. When a slug changes, the existing post action creates a 301 record from the old canonical path.

Both the short-ID URL and the legacy slug URL resolve to the same article during the compatibility period. Canonical metadata points to the official URL.

## Fixes implemented in this audit pass

- Added optional sparse `publicId` to the Post model and content mapper.
- Added stable short ID generation for manual and automated post creation.
- Updated URL generation to append the public ID when present.
- Updated static params and article lookup to support both old slugs and short-ID slugs.
- Normalized redirect matching for article and single-segment legacy routes.
- Enabled single-segment legacy redirects through the existing Redirect collection.
- Preserved the existing sitemap, robots, canonical, schema, and metadata architecture.

## Remaining production work

1. Set `SITE_URL` to the verified production host before deployment.
2. Export the complete CDX URL inventory and compare it with Google Search Console links, indexed pages, and server logs.
3. Recover only confirmed original articles and categories from owned backups or legitimate archives.
4. Add one direct 301 per confirmed valuable URL and test for chains.
5. Add RSS/Atom only if historical references or current editorial requirements justify it.
6. Validate HTTP-to-HTTPS and www-to-non-www behavior at the production proxy/CDN layer.
