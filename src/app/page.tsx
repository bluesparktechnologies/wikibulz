import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, Globe2, Layers3, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { PostCard } from "@/components/blog/post-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { buildCategoryUrl, buildLocationUrl, buildPostUrl } from "@/lib/seo/url";
import { generateStaticMetadata } from "@/lib/seo/metadata";
import { getCategories, getCities, getEditorPicks, getFeaturedPosts, getPopularPosts, getPublishedPosts } from "@/repositories/content.repository";
import type { Category, City, Post } from "@/types/content";

export const metadata = generateStaticMetadata({ title: "Wikibulz Local Rankings And Discovery Guides", description: "Explore clear local ranking guides for healthcare, education, agencies, home services, food, travel, and more.", path: "/", index: true });

export const revalidate = 300;
export const dynamic = "force-dynamic";

const trustSignals = [
  "Transparent ranking criteria",
  "Easy service discovery",
  "Reviewed editorial pages",
  "No fake ratings or claims",
];

const methodology = [
  { title: "Compare clearly", body: "Guides explain the factors readers should check before choosing a local provider." },
  { title: "Choose with confidence", body: "Move from broad research to practical shortlists without confusing steps." },
  { title: "Avoid weak claims", body: "Rankings should not invent ratings, credentials, fees, or guaranteed outcomes." },
];

function categoryChildren(categories: Category[], parentId: string) {
  return categories.filter((category) => category.parentCategory === parentId).sort((a, b) => a.name.localeCompare(b.name));
}

function Hero({ post, totals }: { post?: Post; totals: { cities: number; categories: number; guides: number } }) {
  return <section className="border-b border-[#cbdcd4] bg-[#102d27] text-white">
    <div className="mx-auto grid max-w-7xl gap-9 px-5 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_430px]">
      <div className="flex flex-col justify-center">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#f6c77d]"><Globe2 size={14} /> Local discovery platform</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-normal md:text-6xl">
          Find better local choices across every city.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8e8e1] md:text-lg">
          Wikibulz organizes researched local guides by place and service need so readers can compare clinics, institutes, agencies, restaurants, home services, and more without messy navigation.
        </p>
        <div className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-2">
          {trustSignals.map((signal) => <p key={signal} className="flex items-start gap-2 text-sm font-bold text-[#edf7f3]"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#7ed3b6]" />{signal}</p>)}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#guides" className="inline-flex items-center gap-2 rounded-full bg-[#f3b661] px-5 py-3 text-sm font-black text-[#18251f] transition hover:bg-[#ffd08a]">Browse guides <ArrowRight size={16} /></Link>
          <Link href="/how-we-rank" className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15">How we rank</Link>
        </div>
        <dl className="mt-9 grid max-w-xl grid-cols-3 overflow-hidden rounded-lg border border-white/12 bg-white/8">
          {[
            ["Cities", totals.cities],
            ["Categories", totals.categories],
            ["Guides", totals.guides],
          ].map(([label, value]) => <div key={label} className="border-r border-white/10 px-4 py-4 last:border-r-0"><dt className="text-[11px] font-black uppercase tracking-[0.14em] text-[#a9c5bc]">{label}</dt><dd className="mt-1 text-2xl font-black">{value}</dd></div>)}
        </dl>
      </div>
      <aside className="overflow-hidden rounded-lg border border-white/12 bg-white text-[var(--foreground)] shadow-2xl shadow-black/20">
        {post ? <>
          <Link href={buildPostUrl(post)}>
            <Image src={post.featuredImage.url} alt={post.featuredImage.alt} width={post.featuredImage.width} height={post.featuredImage.height} preload sizes="(min-width: 1024px) 430px, 100vw" className="aspect-[16/10] w-full object-cover" />
          </Link>
          <div className="p-5">
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--accent)]"><Sparkles size={14} /> Featured guide</p>
            <Link href={buildPostUrl(post)} className="mt-2 block text-2xl font-black leading-tight text-[var(--brand-strong)] hover:text-[var(--brand)]">{post.title}</Link>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{post.excerpt}</p>
          </div>
        </> : <div className="p-6"><p className="text-2xl font-black">Start publishing local guides.</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Featured ranking articles will appear here automatically.</p></div>}
      </aside>
    </div>
  </section>;
}

function DiscoveryGrid({ cities, categories }: { cities: City[]; categories: Category[] }) {
  const parentCategories = categories.filter((category) => !category.parentCategory).slice(0, 6);
  return <section className="mx-auto max-w-7xl px-5 py-10">
    <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">Start exploring</p>
        <h2 className="mt-2 text-3xl font-black tracking-normal md:text-4xl">Find guides by place and service</h2>
      </div>
      <Link href="/blog" className="inline-flex w-fit items-center gap-2 text-sm font-black text-[var(--brand)] hover:underline">View all guides <ArrowRight size={15} /></Link>
    </div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.45fr]">
      <section className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[var(--accent)]"><MapPin size={16} /> Places we cover</div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Choose a place to see local guides and service comparisons available there.</p>
        <div className="mt-5 grid gap-3">
          {cities.length ? cities.slice(0, 8).map((city) => <Link key={city.id} href={buildLocationUrl(city)} className="group flex items-center justify-between rounded-md border border-[var(--line)] bg-[#fbfdfb] px-4 py-3 text-sm font-black text-[var(--brand-strong)] transition hover:border-[var(--brand)] hover:bg-[#eef8f3]">{city.name}<ArrowRight size={16} className="transition group-hover:translate-x-0.5" /></Link>) : <p className="rounded-md border border-dashed border-[var(--line)] p-4 text-sm text-[var(--muted)]">Places will appear as coverage expands.</p>}
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {parentCategories.length ? parentCategories.map((category) => {
          const children = categoryChildren(categories, category.id).slice(0, 3);
          return <Link key={category.id} href={buildCategoryUrl(category)} className="group rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <Building2 size={22} className="text-[var(--brand)]" />
              <ArrowRight size={16} className="text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" />
            </div>
            <h3 className="mt-4 text-xl font-black text-[var(--brand-strong)]">{category.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{category.description}</p>
            {children.length ? <div className="mt-4 flex flex-wrap gap-2">{children.map((child) => <span key={child.id} className="rounded-full bg-[#edf6f2] px-3 py-1 text-xs font-black text-[var(--brand-strong)]">{child.name}</span>)}</div> : null}
          </Link>;
        }) : <div className="rounded-lg border border-dashed border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">Categories will appear after editors add them.</div>}
      </section>
    </div>
  </section>;
}

function MethodologyStrip() {
  return <section className="mx-auto max-w-7xl px-5 py-4">
    <div className="rounded-lg border border-[#cddfd8] bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.3fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]"><ShieldCheck size={15} /> Editorial promise</p>
          <h2 className="mt-3 text-3xl font-black tracking-normal md:text-4xl">Useful rankings need structure, not guesswork.</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {methodology.map((item) => <div key={item.title} className="rounded-md border border-[var(--line)] bg-[#f8fbf8] p-4">
            <p className="text-sm font-black text-[var(--brand-strong)]">{item.title}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{item.body}</p>
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}

function Latest({ posts, popular, picks }: { posts: Post[]; popular: Post[]; picks: Post[] }) {
  return <section id="guides" className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_330px]">
    <div>
      <div className="border-b border-[var(--line)] pb-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">Latest guides</p>
        <h2 className="mt-2 text-3xl font-black leading-tight tracking-normal md:text-4xl">Fresh ranking articles</h2>
      </div>
      {posts.length ? <div className="mt-7 grid gap-7 md:grid-cols-2">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div> : <div className="mt-7 rounded-md border border-dashed border-[var(--line)] bg-white p-6"><p className="text-lg font-black">No published guides yet.</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Approved ranking articles will appear here after publication.</p></div>}
    </div>
    <aside className="space-y-7">

      <section className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-black"><Layers3 size={18} /> Popular reads</h2>
        {popular.length ? <ol className="mt-4 space-y-4">{popular.map((post, index) => <li key={post.id} className="grid grid-cols-[24px_1fr] gap-2"><span className="text-sm font-black text-[var(--accent)]">{index + 1}</span><Link href={buildPostUrl(post)} className="text-sm font-bold leading-5 hover:text-[var(--brand)]">{post.title}</Link></li>)}</ol> : <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Popular reads will appear soon.</p>}
      </section>
      <section className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-black"><BadgeCheck size={18} /> Editor picks</h2>
        {picks.length ? picks.map((post) => <Link key={post.id} href={buildPostUrl(post)} className="mt-3 block text-sm font-bold leading-5 text-[var(--brand)] hover:underline">{post.title}</Link>) : <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Selected guides will appear soon.</p>}
      </section>
    </aside>
  </section>;
}

export default async function Home() {
  const [featured, latest, popular, picks, cities, categories] = await Promise.all([getFeaturedPosts(), getPublishedPosts(8), getPopularPosts(), getEditorPicks(), getCities(), getCategories()]);
  const hero = featured[0] || latest[0];
  return <><SiteHeader /><main><Hero post={hero} totals={{ cities: cities.length, categories: categories.length, guides: latest.length }} /><DiscoveryGrid cities={cities} categories={categories} /><MethodologyStrip /><Latest posts={latest} popular={popular} picks={picks} /><section id="newsletter" className="mx-auto max-w-7xl px-5 py-10"><div className="rounded-lg bg-white p-7 shadow-sm ring-1 ring-[var(--line)] md:p-9"><h2 className="max-w-2xl text-3xl font-black leading-tight">Get new ranking guides.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Fresh local comparisons, editorial updates, and new coverage from Wikibulz.</p><NewsletterForm /></div></section></main><Footer /></>;
}
