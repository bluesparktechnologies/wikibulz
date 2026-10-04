import Link from "next/link";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { getPublishedPosts } from "@/repositories/content.repository";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "Guide Topics", description: "Browse Wikibulz local guide topics and tags across cities, categories, and services.", path: "/tags", index: false });
export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const posts = await getPublishedPosts(200);
  const tags = Array.from(new Map(posts.flatMap((post) => post.tags).filter((tag) => tag.slug).map((tag) => [tag.slug, tag])).values()).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Browse Tags</p>
        <h1 className="mt-3 text-5xl font-black">Local Guide Tags</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">Find guides by city, service category, and comparison topic.</p>
        {tags.length ? <div className="mt-8 flex flex-wrap gap-3">{tags.map((tag) => <Link key={tag.slug} href={`/tags/${tag.slug}`} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--brand)] ring-1 ring-[var(--line)]">{tag.name}</Link>)}</div> : <p className="mt-8 rounded-lg border border-dashed border-[var(--line)] bg-white p-6 text-[var(--muted)]">Tags will appear after published articles are available.</p>}
      </main>
      <Footer />
    </>
  );
}
