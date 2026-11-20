import { seoConfig } from "@/config/seo";
import { absoluteUrl, categoryPath, resolveCategoryCanonical, resolveLocationCanonical, resolvePostCanonical } from "@/lib/seo/url";
import { escapeXml, xmlResponse } from "@/lib/seo/xml";
import { getAuthors, getCategories, getCities, getCountries, getPostsByAuthor, getPostsByLocation, getPublishedPosts, getStates, getStaticPages } from "@/repositories/content.repository";
import type { LocationEntity } from "@/types/content";

const publicPages = ["/", "/blog", "/about", "/contact", "/editorial-policy", "/how-we-rank", "/corrections-policy", "/privacy-policy", "/terms", "/advertise", "/write-for-us"];

function urlEntry(url: string, options: { lastmod?: string; changefreq?: string; priority?: string; image?: { url: string; alt: string } } = {}) {
  return `<url><loc>${escapeXml(url)}</loc>${options.lastmod ? `<lastmod>${escapeXml(options.lastmod)}</lastmod>` : ""}${options.changefreq ? `<changefreq>${options.changefreq}</changefreq>` : ""}${options.priority ? `<priority>${options.priority}</priority>` : ""}${options.image ? `<image:image><image:loc>${escapeXml(options.image.url)}</image:loc><image:title>${escapeXml(options.image.alt)}</image:title></image:image>` : ""}</url>`;
}

export async function GET() {
  const [posts, cmsPages, categories, authors, countries, states, cities] = await Promise.all([
    getPublishedPosts(50000), getStaticPages(), getCategories(), getAuthors(), getCountries(), getStates(), getCities(),
  ]);

  const pages = Array.from(new Set([...publicPages, ...(posts.length ? ["/archive"] : []), ...cmsPages.filter((page) => page.robotsIndex).map((page) => "/" + page.slug)]));
  const pageEntries = pages.map((path) => urlEntry(seoConfig.siteUrl + path, { changefreq: path === "/" || path === "/blog" ? "daily" : "monthly", priority: path === "/" ? "1.0" : "0.6" }));

  const postEntries = posts.map((post) => urlEntry(resolvePostCanonical(post), {
    lastmod: post.updatedAt, changefreq: "weekly", priority: post.featured ? "0.9" : "0.7",
    image: { url: absoluteUrl(post.featuredImage.url), alt: post.featuredImage.alt },
  }));

  const publishedCategories = new Set(posts.flatMap((post) => categoryPath(post.category)));
  const categoryEntries = categories
    .filter((category) => category.indexStatus === "index" && publishedCategories.has(category.slug))
    .map((category) => urlEntry(resolveCategoryCanonical(category), { changefreq: "weekly", priority: "0.6" }));

  const locationCandidates: Array<{ location: LocationEntity; type: "country" | "state" | "city" }> = [
    ...countries.map((location) => ({ location, type: "country" as const })),
    ...states.map((location) => ({ location, type: "state" as const })),
    ...cities.map((location) => ({ location, type: "city" as const })),
  ];
  const eligibleLocations = (await Promise.all(locationCandidates.map(async ({ location, type }) =>
    location.status === "active" && location.indexStatus === "index" && (await getPostsByLocation(location, type)).length ? location : null,
  ))).filter((location): location is LocationEntity => location !== null);
  const locationEntries = eligibleLocations.map((location) => urlEntry(resolveLocationCanonical(location), { lastmod: location.updatedAt, changefreq: "weekly", priority: "0.6" }));

  const eligibleAuthors = (await Promise.all(authors.filter((author) => author.status === "active").map(async (author) =>
    (await getPostsByAuthor(author.slug)).length ? author : null,
  ))).filter((author) => author !== null);
  const authorEntries = eligibleAuthors.map((author) => urlEntry(absoluteUrl("/author/" + author.slug), { lastmod: author.updatedAt, changefreq: "monthly", priority: "0.5" }));

  const body = [...pageEntries, ...postEntries, ...categoryEntries, ...locationEntries, ...authorEntries].join("");
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`);
}
