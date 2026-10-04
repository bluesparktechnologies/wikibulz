import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { generateAuthorMetadata } from "@/lib/seo/metadata";
import { personSchema } from "@/lib/seo/schema";
import { getAuthorBySlug, getPostsByAuthor } from "@/repositories/content.repository";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await getAuthorBySlug((await params).slug);
  if (!author) return {};
  const posts = await getPostsByAuthor(author.slug);
  return { ...generateAuthorMetadata(author), robots: { index: author.status === "active" && posts.length > 0, follow: true } };
}

function DetailList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return <div>
    <h2 className="text-sm font-black uppercase tracking-[0.08em] text-[#60736b]">{title}</h2>
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => <span key={item} className="rounded-full border border-[#d3e2da] bg-white px-3 py-1 text-sm font-semibold">{item}</span>)}
    </div>
  </div>;
}

export default async function AuthorPage({ params }: Props) {
  const author = await getAuthorBySlug((await params).slug);
  if (!author) notFound();
  const posts = await getPostsByAuthor(author.slug);
  const publicLinks = [author.website, ...author.socialLinks].filter((url): url is string => Boolean(url));

  return <>
    <SiteHeader />
    <JsonLd data={personSchema(author)} />
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="grid gap-8 rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm md:grid-cols-[180px_1fr]">
        {author.avatar ? <Image src={author.avatar.url} alt={author.avatar.alt} width={author.avatar.width} height={author.avatar.height} className="size-44 rounded-lg object-cover" priority /> : <div className="grid size-44 place-items-center rounded-lg bg-[#e7f1ec] text-6xl font-black text-[var(--brand)]">{author.name.slice(0, 1)}</div>}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--accent)]">Author</p>
          <h1 className="mt-2 text-4xl font-black md:text-5xl">{author.name}</h1>
          <p className="mt-2 text-lg font-semibold text-[var(--brand)]">{[author.jobTitle, author.organization].filter(Boolean).join(" · ")}</p>
          {author.location ? <p className="mt-1 text-sm text-[var(--muted)]">{author.location}</p> : null}
          <p className="mt-5 max-w-3xl leading-7 text-[var(--muted)]">{author.bio}</p>
          {publicLinks.length ? <div className="mt-5 flex flex-wrap gap-3">
            {publicLinks.map((url) => <Link key={url} href={url} rel="nofollow noopener noreferrer" target="_blank" className="rounded-full border border-[#cfe0d8] px-4 py-2 text-sm font-bold text-[var(--brand)]">Profile link</Link>)}
          </div> : null}
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <DetailList title="Expertise" items={author.expertise} />
        <DetailList title="Credentials" items={author.credentials} />
        <DetailList title="Education" items={author.education} />
        <DetailList title="Recognition" items={author.awards} />
      </section>

      <h2 className="mt-12 text-3xl font-black">Articles by {author.name}</h2>
      <div className="mt-6 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCard key={post.id} post={post}/>)}</div>
      {posts.length === 0 ? <p className="mt-6 rounded-lg border border-[var(--line)] bg-white p-5 text-[var(--muted)]">No published articles yet.</p> : null}
    </main>
    <Footer />
  </>;
}
