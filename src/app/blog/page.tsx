import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { PostCard } from "@/components/blog/post-card";
import { absoluteUrl } from "@/lib/seo/url";
import { generateListingMetadata } from "@/lib/seo/metadata";
import { parsePageParam } from "@/lib/seo/pagination";
import { getPublishedPosts } from "@/repositories/content.repository";

const description = "Read the latest WikiBulz explainers and practical guides on money, technology, everyday skills, and how things work.";
export const dynamic = "force-dynamic";
export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ page?: string | string[] }> }): Promise<Metadata> {
  const page = parsePageParam((await searchParams)?.page);
  if (!page) return { title: "Not Found", robots: { index: false, follow: false } };
  const title = page > 1 ? `Latest Technology Blogs - Page ${page}` : "Latest Technology Blogs";
  const canonical = absoluteUrl(page > 1 ? `/blog?page=${page}` : "/blog");
  return generateListingMetadata({ title, description, canonical });
}

export default async function BlogPage({ searchParams }: { searchParams?: Promise<{ page?: string | string[] }> }) {
  const page = parsePageParam((await searchParams)?.page);
  if (!page) notFound();
  const [posts, nextPosts] = await Promise.all([getPublishedPosts(24, page), getPublishedPosts(24, page + 1)]);
  if (page > 1 && !posts.length) notFound();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Latest Articles</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">Technology Blogs</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">Daily practical coverage of artificial intelligence, cybersecurity, software, cloud tools, startups, search trends, and SEO technology.</p>
        {posts.length ? <><div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div><nav className="mt-10 flex gap-3 text-sm font-bold">{page > 1 ? <Link href={page === 2 ? "/blog" : `/blog?page=${page - 1}`} className="rounded border border-[var(--line)] px-4 py-2">Previous</Link> : null}{nextPosts.length ? <Link href={`/blog?page=${page + 1}`} className="rounded border border-[var(--line)] px-4 py-2">Next</Link> : null}</nav></> : <p className="mt-8 rounded-lg border border-dashed border-[var(--line)] bg-white p-6 text-[var(--muted)]">No published blogs on this page.</p>}
      </main>
      <Footer />
    </>
  );
}
