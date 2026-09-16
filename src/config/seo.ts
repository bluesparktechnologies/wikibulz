import { validatedSiteUrl } from "@/lib/validation/env";

const siteName = process.env.SITE_NAME ?? "WikiBulz";

export const seoConfig = {
  siteName,
  siteUrl: validatedSiteUrl,
  titleTemplate: `%s | ${siteName}`,
  defaultDescription: "Clear explainers and practical guides for curious readers, covering money, technology, everyday skills, and how things work.",
  defaultOgImage: "/logo-wikibulz.png",
  timezone: "UTC",
  defaultTagIndexing: process.env.DEFAULT_TAG_INDEXING === "index" ? "index" : "noindex",
  organization: { name: siteName, logo: "/logo-wikibulz.png", sameAs: [] },
  robots: { index: true, follow: true },
  indexingRules: { search: "noindex,follow", previews: "noindex,nofollow", emptyArchives: "noindex,follow" },
} as const;
