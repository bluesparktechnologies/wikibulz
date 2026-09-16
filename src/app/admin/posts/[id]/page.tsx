import { notFound } from "next/navigation";
import { movePostToTrashAction, publishPostAction } from "@/app/admin/posts/actions";
import { PostEditor } from "@/components/admin/post-editor";
import { requireUser } from "@/lib/auth/guards";
import { analyzePostSeo } from "@/lib/seo/analysis";
import { getAdminMedia, getAdminTags } from "@/repositories/admin.repository";
import { getAuthors, getCategories, getPostById, getPublishedPosts } from "@/repositories/content.repository";
import { suggestInternalLinks } from "@/services/internal-links";

type Props = { params: Promise<{ id: string }> };
export default async function EditPostPage({ params }: Props) {
  await requireUser();
  const post = await getPostById((await params).id);
  if (!post) notFound();
  const [all, authors, categories, tags, media] = await Promise.all([getPublishedPosts(100), getAuthors(), getCategories(), getAdminTags(), getAdminMedia()]);
  const checks = analyzePostSeo(post);
  const links = suggestInternalLinks(post, all);
  return <><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-4xl font-black">{post.title}</h1><p className="mt-2 text-[var(--muted)]">SEO Completeness is an internal editorial metric only.</p></div><div className="flex flex-wrap gap-2"><form action={publishPostAction}><input type="hidden" name="id" value={post.id} /><button className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">{post.status === "published" ? "Republish" : "Publish"}</button></form><form action={movePostToTrashAction}><input type="hidden" name="id" value={post.id} /><button className="rounded-md border border-red-300 px-4 py-2 text-sm font-bold text-red-700">Delete</button></form></div></div><div className="mt-8 grid gap-6 lg:grid-cols-2"><section className="rounded-lg border border-[var(--line)] bg-white p-5"><h2 className="text-2xl font-black">SEO Analysis</h2><div className="mt-4 space-y-3">{checks.map((check) => <div key={check.label} className="rounded border border-[var(--line)] p-3"><p className="font-bold">{check.label} <span className="text-xs uppercase text-[var(--accent)]">{check.status}</span></p><p className="mt-1 text-sm text-[var(--muted)]">{check.detail}</p></div>)}</div></section><section className="rounded-lg border border-[var(--line)] bg-white p-5"><h2 className="text-2xl font-black">Internal Link Suggestions</h2><div className="mt-4 space-y-3">{links.map((link) => <div key={link.targetPostId} className="rounded border border-[var(--line)] p-3"><p className="font-bold">{link.suggestedAnchor}</p><p className="text-sm text-[var(--muted)]">{link.targetUrl}</p><p className="mt-1 text-xs text-[#617269]">{link.reason} · relevance {link.relevance}</p></div>)}</div></section></div><PostEditor post={post} authors={authors} categories={categories} tags={tags} media={media} /></>;
}
