import { getCities, getCountries, getPostsByLocation, getStates } from "@/repositories/content.repository";
import { resolveLocationCanonical } from "@/lib/seo/url";
import { escapeXml, xmlResponse } from "@/lib/seo/xml";
import type { LocationEntity } from "@/types/content";

export async function GET() {
  const [countries, states, cities] = await Promise.all([getCountries(), getStates(), getCities()]);
  const candidates: Array<{ location: LocationEntity; type: "country" | "state" | "city" }> = [
    ...countries.map((location) => ({ location, type: "country" as const })),
    ...states.map((location) => ({ location, type: "state" as const })),
    ...cities.map((location) => ({ location, type: "city" as const })),
  ];
  const eligible = (await Promise.all(candidates.map(async (item) => {
    const posts = await getPostsByLocation(item.location, item.type);
    return item.location.status === "active" && item.location.indexStatus === "index" && posts.length ? item.location : null;
  }))).filter((location): location is LocationEntity => location !== null);
  const body = eligible.map((location) => `<url><loc>${escapeXml(resolveLocationCanonical(location))}</loc><lastmod>${escapeXml(location.updatedAt)}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`).join("");
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
}
