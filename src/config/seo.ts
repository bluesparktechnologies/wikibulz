import { validatedSiteUrl } from "@/lib/validation/env";

const siteName = process.env.SITE_NAME ?? "WikiBulz";

export const seoConfig = {
  siteName,
  siteUrl: validatedSiteUrl,
  titleTemplate: `%s | ${siteName}`,
  defaultDescription: "Wikibulz publishes researched local rankings and city guides for healthcare, education, business services, home services, food, real estate, and more.",
  defaultOgImage: "/logo-wikibulz.png",
  timezone: "UTC",
  defaultTagIndexing: process.env.DEFAULT_TAG_INDEXING === "index" ? "index" : "noindex",
  organization: { name: siteName, logo: "/logo-wikibulz.png", sameAs: [] },
  robots: { index: true, follow: true },
  indexingRules: { search: "noindex,follow", previews: "noindex,nofollow", emptyArchives: "noindex,follow" },
} as const;
