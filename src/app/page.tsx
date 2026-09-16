import Link from "next/link";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { PostCard } from "@/components/blog/post-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { buildPostUrl } from "@/lib/seo/url";
import { generateStaticMetadata } from "@/lib/seo/metadata";
import { getEditorPicks, getFeaturedPosts, getPopularPosts, getPublishedPosts } from "@/repositories/content.repository";

export const metadata = generateStaticMetadata({ title: "Clear Explainers And Practical Guides", description: "WikiBulz publishes clear explainers and practical guides about money, technology, everyday skills, and how things work.", path: "/", index: true });
import type { Post } from "@/types/content";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const focusTopics = ["Artificial Intelligence", "Cybersecurity", "Software", "Cloud Computing", "SEO Technology", "Startups"];

function formatDate(value?: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value ? new Date(value) : new Date());
}

function Hero({ post }: { post?: Post }) {
  return (
    <section className="bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">WikiBulz</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.06] text-[var(--foreground)] md:text-5xl lg:text-6xl">
            Daily technology stories with clear context, not noise.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">
            Fresh blogs on AI, cybersecurity, software, cloud platforms, startups, SEO technology, and the tools changing digital business.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {focusTopics.map((topic) => (
              <span key={topic} className="rounded-full border border-[var(--line)] bg-[#f7faf8] px-3 py-1.5 text-xs font-bold text-[#40544b]">{topic}</span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#latest" className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--brand-strong)]">Read Latest</Link>
            <Link href="/blog" className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-black text-[var(--brand-strong)] transition hover:border-[var(--brand)]">Browse Blog</Link>
          </div>
        </div>
        <aside className="border-t border-[var(--line)] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">Lead Story</p>
          {post ? (
            <article className="mt-4">
              <Link href={buildPostUrl(post)} className="block text-2xl font-black leading-tight text-[var(--brand-strong)] hover:underline">{post.title}</Link>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{post.excerpt}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#66756e]">{post.category.name} / {formatDate(post.publishedAt || post.updatedAt)} / {post.readingTime || 3} min read</p>
            </article>
          ) : (
            <div className="mt-4 rounded-md border border-dashed border-[var(--line)] bg-[#f9fbfa] p-5">
              <p className="text-xl font-black text-[var(--brand-strong)]">Publishing starts here.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Approved technology blogs will appear as the lead story automatically.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

const newsroomCards = [
  {
    title: "News with useful context",
    body: "We explain what changed, who it affects, and why it matters for people building, buying, or running digital products.",
  },
  {
    title: "Practical guides for busy readers",
    body: "Expect clear takeaways on AI tools, cybersecurity risks, cloud software, SEO technology, startups, and digital business trends.",
  },
  {
    title: "Signals worth following",
    body: "Our coverage focuses on product shifts, security updates, search behavior, developer tools, and technology decisions that can shape work.",
  },
];

function NewsroomFocus() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10">
      <div className="grid gap-6 border-y border-[var(--line)] py-8 lg:grid-cols-[0.9fr_1.4fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">How We Cover Tech</p>
          <h2 className="mt-3 max-w-md text-3xl font-black leading-tight text-[var(--foreground)]">
            Daily updates shaped for real decisions.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {newsroomCards.map((card) => (
            <article key={card.title} className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
              <h3 className="text-base font-black text-[var(--brand-strong)]">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Latest({ posts, popular, picks }: { posts: Post[]; popular: Post[]; picks: Post[] }) {
  return (
    <section id="latest" className="mx-auto grid max-w-7xl gap-10 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="border-b border-[var(--line)] pb-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">Latest</p>
          <h2 className="mt-2 text-3xl font-black leading-tight">New Technology Blogs</h2>
        </div>
        {posts.length ? (
          <div className="mt-7 grid gap-7 md:grid-cols-2">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
        ) : (
          <div className="mt-7 rounded-md border border-dashed border-[var(--line)] bg-white p-6">
            <p className="text-lg font-black">No published stories yet.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Published articles will appear here after approval.</p>
          </div>
        )}
      </div>
      <aside className="space-y-7">
        <section className="border-t border-[var(--line)] pt-4">
          <h2 className="text-lg font-black">Today&apos;s Focus</h2>
          <div className="mt-4 grid gap-3">
            {focusTopics.slice(0, 5).map((topic) => <p key={topic} className="text-sm font-bold text-[#354840]">{topic}</p>)}
          </div>
        </section>
        <section className="border-t border-[var(--line)] pt-4">
          <h2 className="text-lg font-black">Popular Reads</h2>
          {popular.length ? <ol className="mt-4 space-y-4">{popular.map((post, index) => <li key={post.id} className="grid grid-cols-[24px_1fr] gap-2"><span className="text-sm font-black text-[var(--accent)]">{index + 1}</span><Link href={buildPostUrl(post)} className="text-sm font-bold leading-5 hover:text-[var(--brand)]">{post.title}</Link></li>)}</ol> : <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Popular reads will appear soon.</p>}
        </section>
        <section className="border-t border-[var(--line)] pt-4">
          <h2 className="text-lg font-black">Editor Picks</h2>
          {picks.length ? picks.map((post) => <Link key={post.id} href={buildPostUrl(post)} className="mt-3 block text-sm font-bold leading-5 text-[var(--brand)]">{post.title}</Link>) : <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Selected stories will appear soon.</p>}
        </section>
      </aside>
    </section>
  );
}

export default async function Home() {
  const [featured, latest, popular, picks] = await Promise.all([getFeaturedPosts(), getPublishedPosts(8), getPopularPosts(), getEditorPicks()]);
  const hero = featured[0] || latest[0];
  return (
    <>
      <SiteHeader />
      <main>
        <Hero post={hero} />
        <NewsroomFocus />
        <Latest posts={latest} popular={popular} picks={picks} />
        <section id="newsletter" className="mx-auto max-w-7xl px-5 py-10">
          <div className="rounded-md bg-[#0d2f29] p-7 text-white md:p-9">
            <h2 className="max-w-2xl text-3xl font-black leading-tight">Get the weekly tech brief.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c9d8d1]">Useful explainers, money basics, technology guides, and everyday ideas from WikiBulz.</p>
            <NewsletterForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
