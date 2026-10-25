import { validatedSiteUrl } from "@/lib/validation/env";

const siteName = process.env.SITE_NAME ?? "WikiBulz";

export const seoConfig = {
  siteName,
  siteUrl: validatedSiteUrl,
  titleTemplate: `%s | ${siteName}`,
  defaultDescription: "Wikibulz publishes researched local rankings and city guides for healthcare, education, business services, home services, food, real estate, and more.",
  defaultOgImage: "/logo-wikibulz.png",
  timezone: "UTC",
  siteFoundedYear: "2017",
  siteHistory: {
    homepageArchive: "https://web.archive.org/web/20171006171815/https://wikibulz.com/",
    articleArchive: "https://web.archive.org/web/20171006155436/https://wikibulz.com/property-costs-decline-throughout-top-8-cities-in-2016/",
    articleTitle: "Property costs decline throughout top 8 cities in 2016",
  },
  defaultTagIndexing: process.env.DEFAULT_TAG_INDEXING === "index" ? "index" : "noindex",
  organization: { name: siteName, logo: "/logo-wikibulz.png", sameAs: [] },
  robots: { index: true, follow: true },
  indexingRules: { search: "noindex,follow", previews: "noindex,nofollow", emptyArchives: "noindex,follow" },
} as const;
