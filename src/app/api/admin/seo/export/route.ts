import { requireRole } from "@/lib/auth/guards";
import { buildPostUrl, resolvePostCanonical } from "@/lib/seo/url";
import { getPublishedPosts } from "@/repositories/content.repository";

const csvCell = (value: string | number | boolean | undefined) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  await requireRole("seo");
  const posts = await getPublishedPosts(50000);
  const header = ["URL", "Title", "SEO Title", "Meta Description", "Canonical", "Robots", "Status", "Category", "Author", "Published", "Updated", "Inbound Links", "Outbound Links", "Word Count"];
  const rows = posts.map((post) => {
    const url = buildPostUrl(post);
    const inbound = posts.filter((candidate) => candidate.content.includes(url) || candidate.manualInternalLinks.includes(post.id)).length;
    const outbound = (post.content.match(/href="/g) ?? []).length;
    return [
      url,
      post.title,
      post.seoTitle,
      post.metaDescription,
      resolvePostCanonical(post),
      `${post.robotsIndex ? "index" : "noindex"},${post.robotsFollow ? "follow" : "nofollow"}`,
      post.status,
      post.category.name,
      post.author.name,
      post.publishedAt,
      post.updatedAt,
      inbound,
      outbound,
      post.wordCount,
    ].map(csvCell).join(",");
  });
  return new Response([header.map(csvCell).join(","), ...rows].join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=seo-url-inventory.csv",
    },
  });
}
