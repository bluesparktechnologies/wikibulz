import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { PostCard } from "@/components/blog/post-card";
import { getPublishedPosts } from "@/repositories/content.repository";
import { generateStaticMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const posts = await getPublishedPosts(200);
  const tag = posts.flatMap((post) => post.tags).find((item) => item.slug === slug);
  return tag ? generateStaticMetadata({ title: `${tag.name} Articles`, description: `Read WikiBulz articles tagged ${tag.name}.`, path: `/tags/${tag.slug}`, index: false }) : {};
}

export default async function TagPage({ params }: Props) {
  const slug = (await params).slug;
  const posts = (await getPublishedPosts(200)).filter((post) => post.tags.some((tag) => tag.slug === slug));
  const tag = posts.flatMap((post) => post.tags).find((item) => item.slug === slug);
  if (!tag) notFound();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Tag</p>
        <h1 className="mt-3 text-5xl font-black">{tag.name}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">Latest WikiBulz articles and explainers tagged with {tag.name}.</p>
        <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
      </main>
      <Footer />
    </>
  );
}
