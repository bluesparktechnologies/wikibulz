import { getCategories, getPublishedPosts } from "@/repositories/content.repository";
import { categoryPath, resolveCategoryCanonical } from "@/lib/seo/url";
import { escapeXml, xmlResponse } from "@/lib/seo/xml";

export async function GET() {
  const publishedCategories = new Set((await getPublishedPosts(50000)).flatMap((post) => categoryPath(post.category)));
  const categories = (await getCategories()).filter((category) => category.indexStatus === "index" && publishedCategories.has(category.slug));
  const body = categories.map((category) => `<url><loc>${escapeXml(resolveCategoryCanonical(category))}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`).join("");
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
}
