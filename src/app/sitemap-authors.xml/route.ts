import { getAuthors, getPostsByAuthor } from "@/repositories/content.repository";
import { absoluteUrl } from "@/lib/seo/url";
import { escapeXml, xmlResponse } from "@/lib/seo/xml";
import type { Author } from "@/types/content";

export async function GET() {
  const authors = await getAuthors();
  const eligible = (await Promise.all(authors.filter((author) => author.status === "active").map(async (author) => (await getPostsByAuthor(author.slug)).length ? author : null))).filter((author): author is Author => author !== null);
  const body = eligible.map((author) => `<url><loc>${escapeXml(absoluteUrl("/author/" + author.slug))}</loc><lastmod>${escapeXml(author.updatedAt)}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`).join("");
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
}
