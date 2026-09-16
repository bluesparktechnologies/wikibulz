import { requireRole } from "@/lib/auth/guards";
import { buildPostUrl, resolvePostCanonical } from "@/lib/seo/url";
import { getPublishedPosts, getRedirects } from "@/repositories/content.repository";

export async function GET(request: Request) {
  await requireRole("seo");
  const url = new URL(request.url);
  const path = url.searchParams.get("path") ?? "/";
  const posts = await getPublishedPosts(50000);
  const redirects = await getRedirects();
  const post = posts.find((item) => buildPostUrl(item) === path);
  const redirect = redirects.find((item) => item.sourcePath === path);
  if (redirect) return Response.json({ path, type: "redirect", status: redirect.statusCode, destination: redirect.destinationPath, sitemapIncluded: false });
  if (!post) return Response.json({ path, type: "unknown", status: 404, sitemapIncluded: false });
  const inbound = posts.filter((candidate) => candidate.content.includes(path) || candidate.manualInternalLinks.includes(post.id));
  const outbound = Array.from(post.content.matchAll(/href="([^"]+)"/g)).map((match) => match[1]);
  return Response.json({
    path,
    type: "post",
    status: 200,
    indexSetting: post.robotsIndex ? "index" : "noindex",
    canonical: resolvePostCanonical(post),
    seoTitle: post.seoTitle || post.title,
    metaDescription: post.metaDescription || post.excerpt,
    h1: post.title,
    schemaTypes: [post.schemaType, post.faqs.length ? "FAQPage" : undefined].filter(Boolean),
    inboundInternalLinks: inbound.length,
    outboundInternalLinks: outbound,
    sitemapIncluded: post.status === "published" && post.robotsIndex,
    lastModified: post.updatedAt,
  });
}
