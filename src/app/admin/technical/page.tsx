import { CacheInvalidateForm, RevalidationForm } from "@/components/admin/technical-forms";
import { seoConfig } from "@/config/seo";
import { requireRole } from "@/lib/auth/guards";
import { getRedis } from "@/lib/redis/client";
import { categoryPath } from "@/lib/seo/url";
import { getAuthors, getCategories, getCities, getCountries, getPostsByAuthor, getPostsByLocation, getPublishedPosts, getStates, getStaticPages } from "@/repositories/content.repository";
import type { LocationEntity } from "@/types/content";

const publicPageCount = 11;

export default async function TechnicalAdminPage() {
  await requireRole("seo");
  const [redisStatus, posts, categories, authors, countries, states, cities, staticPages] = await Promise.all([
    getRedis().then((client) => client ? "connected" : "not configured").catch(() => "unavailable"),
    getPublishedPosts(50000),
    getCategories(),
    getAuthors(),
    getCountries(),
    getStates(),
    getCities(),
    getStaticPages(),
  ]);
  const publishedCategories = new Set(posts.flatMap((post) => categoryPath(post.category)));
  const categoryCount = categories.filter((category) => category.indexStatus === "index" && publishedCategories.has(category.slug)).length;
  const locationCandidates: Array<{ location: LocationEntity; type: "country" | "state" | "city" }> = [
    ...countries.map((location) => ({ location, type: "country" as const })),
    ...states.map((location) => ({ location, type: "state" as const })),
    ...cities.map((location) => ({ location, type: "city" as const })),
  ];
  const [locationCount, authorCount] = await Promise.all([
    Promise.all(locationCandidates.map(async (item) => item.location.status === "active" && item.location.indexStatus === "index" && (await getPostsByLocation(item.location, item.type)).length ? 1 : 0)).then((items) => items.filter(Boolean).length),
    Promise.all(authors.filter((author) => author.status === "active").map(async (author) => (await getPostsByAuthor(author.slug)).length ? 1 : 0)).then((items) => items.filter(Boolean).length),
  ]);
  const pageCount = publicPageCount + staticPages.filter((page) => page.robotsIndex).length + (posts.length ? 1 : 0);
  const sitemapRows = [
    { label: "Sitemap Index", url: "/sitemap.xml", count: 5 },
    { label: "Page Sitemap", url: "/sitemap-pages.xml", count: pageCount },
    { label: "Post Sitemap", url: "/sitemap-posts-1.xml", count: posts.length },
    { label: "Category Sitemap", url: "/sitemap-categories.xml", count: categoryCount },
    { label: "Location Sitemap", url: "/sitemap-locations.xml", count: locationCount },
    { label: "Author Sitemap", url: "/sitemap-authors.xml", count: authorCount },
  ];
  return <><h1 className="text-4xl font-black">Technical SEO</h1><p className="mt-2 text-[var(--muted)]">Sitemaps, robots, indexing policy, cache readiness, and safe page revalidation.</p><div className="mt-8 grid gap-5 md:grid-cols-3"><div className="rounded-lg border border-[var(--line)] bg-white p-5"><p className="text-sm font-semibold text-[var(--muted)]">Redis status</p><p className="mt-2 text-3xl font-black">{redisStatus}</p></div><div className="rounded-lg border border-[var(--line)] bg-white p-5"><p className="text-sm font-semibold text-[var(--muted)]">Site URL</p><p className="mt-2 break-all text-xl font-black">{seoConfig.siteUrl}</p></div><div className="rounded-lg border border-[var(--line)] bg-white p-5"><p className="text-sm font-semibold text-[var(--muted)]">Robots default</p><p className="mt-2 text-xl font-black">{seoConfig.robots.index ? "index" : "noindex"},{seoConfig.robots.follow ? "follow" : "nofollow"}</p></div></div><section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5"><h2 className="text-2xl font-black">Sitemap Status</h2><div className="mt-4 overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Name</th><th>URL</th><th>URLs</th><th>Cache</th></tr></thead><tbody>{sitemapRows.map((row) => <tr key={row.url} className="border-t border-[var(--line)]"><td className="p-3 font-bold">{row.label}</td><td><a className="font-bold text-[var(--brand)]" href={row.url}>{row.url}</a></td><td>{row.count}</td><td>5 min edge freshness</td></tr>)}</tbody></table></div></section><section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5"><h2 className="text-2xl font-black">Indexing Rules</h2><div className="mt-4 grid gap-3 text-sm md:grid-cols-3"><p><strong>Search pages:</strong> {seoConfig.indexingRules.search}</p><p><strong>Preview pages:</strong> {seoConfig.indexingRules.previews}</p><p><strong>Empty archives:</strong> {seoConfig.indexingRules.emptyArchives}</p><p><strong>Default tag indexing:</strong> {seoConfig.defaultTagIndexing}</p><p><strong>Robots file:</strong> <a className="font-bold text-[var(--brand)]" href="/robots.txt">/robots.txt</a></p><p><strong>Sitemap file:</strong> <a className="font-bold text-[var(--brand)]" href="/sitemap.xml">/sitemap.xml</a></p></div></section><div className="mt-8 grid gap-5 md:grid-cols-2"><RevalidationForm /><CacheInvalidateForm /></div></>;
}
