import { seoConfig } from "@/config/seo";
import { escapeXml, xmlResponse } from "@/lib/seo/xml";

export async function GET() {
  const sitemaps = ["/sitemap-pages.xml", "/sitemap-posts-1.xml", "/sitemap-categories.xml", "/sitemap-locations.xml", "/sitemap-authors.xml"];
  const body = sitemaps.map((path) => `<sitemap><loc>${escapeXml(seoConfig.siteUrl + path)}</loc></sitemap>`).join("");
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`);
}
