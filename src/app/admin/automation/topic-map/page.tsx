import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getCategories, getPublishedPosts } from "@/repositories/content.repository";

export default async function TopicMapPage() {
  await requireRole("seo");
  const [categories, posts] = await Promise.all([getCategories(), getPublishedPosts(50000)]);
  const rows = categories.map((category) => {
    const categoryPosts = posts.filter((post) => post.category.slug === category.slug);
    const pillar = categoryPosts.find((post) => post.featured) ?? categoryPosts[0];
    const supporting = categoryPosts.filter((post) => post.id !== pillar?.id);
    return { category, pillar, supporting, coverage: Math.min(100, categoryPosts.length * 20) };
  });
  return <><p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Automation</p><h1 className="mt-2 text-4xl font-black">Topical Authority Map</h1><p className="mt-2 text-[var(--muted)]">Uses current published content to show pillars, supporting pages, and coverage gaps before creating new URLs.</p><div className="mt-8 grid gap-5">{rows.map((row) => <section key={row.category.id} className="rounded-lg border border-[var(--line)] bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-black">{row.category.name}</h2><p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{row.category.description}</p></div><p className="rounded-md bg-[#eef5f1] px-3 py-2 text-sm font-black">{row.coverage}% coverage</p></div><div className="mt-5 grid gap-4 md:grid-cols-2"><div><p className="text-sm font-black uppercase text-[var(--accent)]">Pillar</p>{row.pillar ? <Link className="mt-2 block font-bold text-[var(--brand)]" href={`/admin/posts/${row.pillar.id}`}>{row.pillar.title}</Link> : <p className="mt-2 text-sm text-[var(--muted)]">Missing pillar page</p>}</div><div><p className="text-sm font-black uppercase text-[var(--accent)]">Supporting Pages</p>{row.supporting.length ? row.supporting.map((post) => <Link key={post.id} className="mt-2 block text-sm font-bold text-[var(--brand)]" href={`/admin/posts/${post.id}`}>{post.title}</Link>) : <p className="mt-2 text-sm text-[var(--muted)]">Supporting content gap</p>}</div></div></section>)}</div></>;
}
