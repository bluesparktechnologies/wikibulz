import { seoConfig } from "@/config/seo";
import { escapeXml, xmlResponse } from "@/lib/seo/xml";
import { getPublishedPosts, getStaticPages } from "@/repositories/content.repository";

const publicPages = ["/", "/blog", "/about", "/contact", "/editorial-policy", "/how-we-rank", "/corrections-policy", "/privacy-policy", "/terms", "/advertise", "/write-for-us"];

export async function GET() {
  const cmsPages = (await getStaticPages()).filter((page) => page.robotsIndex).map((page) => "/" + page.slug);
  const pages = Array.from(new Set((await getPublishedPosts(1)).length ? [...publicPages, "/archive", ...cmsPages] : [...publicPages, ...cmsPages]));
  const body = pages.map((path) => `<url><loc>${escapeXml(seoConfig.siteUrl + path)}</loc><changefreq>${path === "/" || path === "/blog" ? "daily" : "monthly"}</changefreq><priority>${path === "/" ? "1.0" : "0.6"}</priority></url>`).join("");
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
}
