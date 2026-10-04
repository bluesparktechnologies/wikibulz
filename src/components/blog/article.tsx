import Image from "next/image";
import Link from "next/link";
import { ensureHeadingIds, generateTableOfContents } from "@/lib/content/processing";
import { sanitizeArticleHtml } from "@/lib/seo/analysis";
import { buildCategoryUrl, buildLocationUrl, buildPostUrl } from "@/lib/seo/url";
import type { Post } from "@/types/content";

export function ArticleView({ post, related }: { post: Post; related: Post[] }) {
  const safeContent = ensureHeadingIds(sanitizeArticleHtml(post.content));
  const tableOfContents = post.tableOfContents.length ? post.tableOfContents : generateTableOfContents(safeContent);
  const breadcrumbs = [
    { name: "Home", href: "/" },
    post.country ? { name: post.country.name, href: buildLocationUrl(post.country) } : null,
    post.state ? { name: post.state.name, href: buildLocationUrl(post.state) } : null,
    post.city ? { name: post.city.name, href: buildLocationUrl(post.city) } : null,
    { name: post.category.name, href: buildCategoryUrl(post.category) },
  ].filter((item): item is { name: string; href: string } => Boolean(item));

  return <main className="mx-auto max-w-7xl px-5 py-8">
    <nav className="flex flex-wrap gap-2 text-sm font-semibold text-[var(--muted)]">
      {breadcrumbs.map((crumb) => <span key={crumb.href} className="flex gap-2"><Link href={crumb.href}>{crumb.name}</Link><span>/</span></span>)}
      <span>{post.title}</span>
    </nav>
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article>
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">{post.category.name}</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[1.05] md:text-6xl">{post.title}</h1>
        <p className="mt-5 max-w-3xl text-xl leading-8 text-[var(--muted)]">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-[#52635b]">
          <Link href={"/author/" + post.author.slug}>By {post.author.name}</Link>
          <span>Published {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(post.publishedAt || post.updatedAt))}</span>
          <span>Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(post.updatedAt))}</span>
          <span>{post.readingTime} min read</span>
        </div>
        {post.reviewedBy || post.reviewer || post.factCheckedBy ? <div className="mt-4 grid max-w-3xl gap-2 rounded-lg border border-[var(--line)] bg-white p-4 text-sm text-[#52635b]">
          {post.reviewedBy || post.reviewer ? <p><strong>Reviewed by:</strong> {post.reviewedBy || post.reviewer?.name}{post.lastReviewedAt ? " on " + new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(post.lastReviewedAt)) : ""}</p> : null}
          {post.factCheckedBy ? <p><strong>Fact checked by:</strong> {post.factCheckedBy.name}</p> : null}
        </div> : null}
        <Image src={post.featuredImage.url} alt={post.featuredImage.alt} width={post.featuredImage.width} height={post.featuredImage.height} preload sizes="(min-width: 1024px) 900px, 100vw" className="mt-8 aspect-[16/9] w-full rounded-lg object-cover" />
        <div className="prose-content mt-8 max-w-3xl" dangerouslySetInnerHTML={{ __html: safeContent }} />
        {post.sources.length ? <SourceList title="Sources" sources={post.sources} /> : null}
        {post.references.length ? <SourceList title="References" sources={post.references} /> : null}
        {post.faqs.length ? <section className="mt-10 max-w-3xl border-t border-[var(--line)] pt-6"><h2 className="text-2xl font-black">FAQs</h2>{post.faqs.map((faq) => <details key={faq.question} className="mt-4 rounded-lg border border-[var(--line)] bg-white p-4"><summary className="font-bold">{faq.question}</summary><p className="mt-3 text-[var(--muted)]">{faq.answer}</p></details>)}</section> : null}
        <section className="mt-10 max-w-3xl rounded-lg border border-[var(--line)] bg-white p-5">
          <h2 className="text-xl font-black">About {post.author.name}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{post.author.bio}</p>
          <p className="mt-3 text-xs font-semibold text-[#617269]">Expertise: {post.author.expertise.join(", ") || "Provided by editorial team"}</p>
          <Link href={"/author/" + post.author.slug} className="mt-4 inline-block text-sm font-bold text-[var(--brand)]">View author profile</Link>
        </section>
      </article>
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-lg border border-[var(--line)] bg-white p-5"><p className="font-black">Table of Contents</p><ol className="mt-4 space-y-2 text-sm text-[var(--muted)]">{tableOfContents.map((item) => <li key={item.id} className={item.level === 3 ? "pl-4" : ""}><a href={"#" + item.id}>{item.text}</a></li>)}</ol></div>
        <div className="mt-6 rounded-lg border border-[var(--line)] bg-white p-5"><p className="font-black">Related Articles</p><div className="mt-4 space-y-4">{related.map((item) => <Link key={item.id} href={buildPostUrl(item)} className="block text-sm font-semibold leading-5 text-[var(--brand)]">{item.title}</Link>)}</div></div>
        <div className="mt-6 rounded-lg border border-[var(--line)] bg-[#fffaf0] p-5 text-sm text-[#6d4b16]">
          <p className="font-black">Found outdated information?</p>
          <Link href="/corrections-policy" className="mt-2 inline-block font-bold text-[#8a5a05] hover:underline">Request a correction</Link>
        </div>
      </aside>
    </div>
  </main>;
}

function SourceList({ title, sources }: { title: string; sources: Post["sources"] }) {
  return <section className="mt-10 max-w-3xl border-t border-[var(--line)] pt-6"><h2 className="text-2xl font-black">{title}</h2><ol className="mt-4 space-y-3 text-sm text-[var(--muted)]">{sources.map((source) => <li key={source.url}><a href={source.url} rel="noopener noreferrer" target="_blank" className="font-semibold text-[var(--brand)]">{source.title}</a>{source.publisher ? " - " + source.publisher : ""}{source.dateAccessed ? " - Accessed " + new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(source.dateAccessed)) : ""}</li>)}</ol></section>;
}
