import { getPublishedPosts } from "@/repositories/content.repository";
import { absoluteUrl, resolvePostCanonical } from "@/lib/seo/url";
import { escapeXml, xmlResponse } from "@/lib/seo/xml";

export async function GET() {
  const posts = await getPublishedPosts(50000);
  const body = posts.map((post) => {
    const imageUrl = absoluteUrl(post.featuredImage.url);
    return `<url><loc>${escapeXml(resolvePostCanonical(post))}</loc><lastmod>${escapeXml(post.updatedAt)}</lastmod><changefreq>weekly</changefreq><priority>${post.featured ? "0.9" : "0.7"}</priority><image:image><image:loc>${escapeXml(imageUrl)}</image:loc><image:title>${escapeXml(post.featuredImage.alt)}</image:title></image:image></url>`;
  }).join("");
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`);
}