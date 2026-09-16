import { Metric } from "@/components/admin/admin-shell";
import { requireUser } from "@/lib/auth/guards";
import { getCategories, getPublishedPosts } from "@/repositories/content.repository";
import { detectOrphanPosts } from "@/services/internal-links";

const freshnessReferenceTime = Date.parse("2026-08-26T00:00:00.000Z");

export default async function AdminDashboard() {
  await requireUser();
  const [posts, categories] = await Promise.all([getPublishedPosts(100), getCategories()]);
  const stale = posts.filter((post) => freshnessReferenceTime - Date.parse(post.updatedAt) > 1000 * 60 * 60 * 24 * 180);
  const orphaned = detectOrphanPosts(posts);
  return <><div><p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Admin</p><h1 className="mt-2 text-4xl font-black">Publishing Operations</h1><p className="mt-2 text-[var(--muted)]">Editorial workflow, SEO health, crawlability, freshness, redirects, and cache readiness.</p></div><div className="mt-8 grid gap-5 md:grid-cols-4"><Metric label="Published posts" value={String(posts.length)} caption="Published content from the repository"/><Metric label="Categories" value={String(categories.length)} caption="Nested schema support included"/><Metric label="Freshness reviews" value={String(stale.length)} caption="Older than six months"/><Metric label="Potential orphans" value={String(orphaned.length)} caption="No meaningful inbound internal links"/></div><section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5"><h2 className="text-2xl font-black">Workflow</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{["Draft", "Review", "Scheduled", "Published", "Archived", "Trash"].map((status) => <div key={status} className="rounded border border-[var(--line)] p-4"><p className="font-bold">{status}</p><p className="mt-2 text-sm text-[var(--muted)]">RBAC-aware status supported by the post model.</p></div>)}</div></section></>;
}
