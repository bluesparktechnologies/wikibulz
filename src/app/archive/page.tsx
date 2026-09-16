import Link from "next/link";
import { generateStaticMetadata } from "@/lib/seo/metadata";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { buildPostUrl } from "@/lib/seo/url";
import { getPublishedPosts } from "@/repositories/content.repository";

export const dynamic = "force-dynamic";
export async function generateMetadata() { const indexable = (await getPublishedPosts(1)).length > 0; return generateStaticMetadata({ title: "Guide Archive", description: "Browse the WikiBulz archive of explainers, practical guides, money basics, technology articles, and everyday ideas.", path: "/archive", index: indexable }); }

export default async function ArchivePage() {
  const posts = await getPublishedPosts(500);
  const groups = posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const key = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(post.publishedAt || post.updatedAt));
    acc[key] = [...(acc[key] ?? []), post];
    return acc;
  }, {});
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Archive</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">Technology Blog Archive</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">Browse older WikiBulz articles by month.</p>
        <div className="mt-8 grid gap-6">
          {Object.entries(groups).length ? Object.entries(groups).map(([month, monthPosts]) => <section key={month} className="rounded-lg border border-[var(--line)] bg-white p-5"><h2 className="text-2xl font-black">{month}</h2><div className="mt-4 grid gap-3">{monthPosts.map((post) => <Link key={post.id} href={buildPostUrl(post)} className="font-bold text-[var(--brand)]">{post.title}</Link>)}</div></section>) : <p className="rounded-lg border border-dashed border-[var(--line)] bg-white p-6 text-[var(--muted)]">Archive will appear after articles are published.</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}
