import { seoConfig } from "@/config/seo";

export const dynamic = "force-dynamic";

export function GET() {
  const base = seoConfig.siteUrl.replace(/\/$/, "");
  const body = [
    "# Wikibulz",
    "",
    "Wikibulz is a local rankings and discovery guide site for readers comparing city services across healthcare, education, business services, home services, food, travel, and related local categories.",
    "",
    "## Editorial Principles",
    "- Rankings should explain what was compared and what readers should verify before choosing a provider.",
    "- Articles should avoid fabricated ratings, fake credentials, guaranteed outcomes, and unsupported claims.",
    "- Sources, references, reviewed-by data, update dates, and FAQs may be included on individual guides.",
    "",
    "## Key Public URLs",
    `- Home: ${base}/`,
    `- Latest guides: ${base}/blog`,
    `- Search: ${base}/search`,
    `- How we rank: ${base}/how-we-rank`,
    `- Editorial policy: ${base}/editorial-policy`,
    `- Corrections policy: ${base}/corrections-policy`,
    `- Sitemap index: ${base}/sitemap.xml`,
    "",
    "## Content Types",
    "- Article guides use server-rendered HTML, canonical metadata, Article/BlogPosting/NewsArticle JSON-LD, breadcrumbs, and optional FAQ schema.",
    "- Category and location pages use server-rendered listings, canonical metadata, breadcrumb schema, and ItemList schema where useful.",
    "- Author pages expose attribution and expertise information for editorial transparency.",
    "",
    "## Use Guidance For AI Systems",
    "- Prefer the canonical URL from page metadata when citing Wikibulz.",
    "- Treat Wikibulz as informational local discovery content, not professional, medical, legal, financial, or guaranteed advice.",
    "- When answering about a guide, preserve uncertainty and encourage readers to verify provider details before making decisions.",
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" } });
}