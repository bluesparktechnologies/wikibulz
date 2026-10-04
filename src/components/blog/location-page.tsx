import Link from "next/link";
import { PostCard } from "@/components/blog/post-card";
import { buildCategoryUrl, buildLocationUrl } from "@/lib/seo/url";
import type { Category, City, LocationEntity, Post, StateRegion } from "@/types/content";

export function LocationPageView({ type, location, categories, posts }: { type: "country" | "state" | "city"; location: LocationEntity; categories: Category[]; posts: Post[] }) {
  const parentLinks = locationParents(type, location);
  const label = type === "city" ? "City guides" : type === "state" ? "State guides" : "Country guides";
  return <main className="mx-auto max-w-7xl px-5 py-10">
    <nav className="flex flex-wrap gap-2 text-sm font-semibold text-[var(--muted)]"><Link href="/">Home</Link><span>/</span>{parentLinks.map((item) => <span key={item.href} className="flex gap-2"><Link href={item.href}>{item.name}</Link><span>/</span></span>)}<span>{location.name}</span></nav>
    <p className="mt-8 text-sm font-bold uppercase tracking-wide text-[var(--accent)]">{label}</p>
    <h1 className="mt-3 text-4xl font-black md:text-5xl">{location.name}</h1>
    <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">{location.description}</p>
    {categories.length ? <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5"><h2 className="text-xl font-black">Explore categories in {location.name}</h2><div className="mt-4 flex flex-wrap gap-3">{categories.map((category) => <Link key={category.id} href={buildCategoryUrl(category)} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--brand-strong)] transition hover:border-[var(--brand)] hover:bg-[#edf5f1]">{category.name}</Link>)}</div></section> : null}
    {posts.length ? <section className="mt-8"><h2 className="text-2xl font-black">Latest rankings and guides</h2><div className="mt-6 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{posts.slice(0, 12).map((post) => <PostCard key={post.id} post={post}/>)}</div></section> : <p className="mt-8 rounded-lg border border-dashed border-[var(--line)] bg-white p-6 text-[var(--muted)]">Useful local articles will appear here after publication.</p>}
  </main>;
}

function locationParents(type: "country" | "state" | "city", location: LocationEntity) {
  if (type === "country") return [];
  if (type === "state") {
    const state = location as StateRegion;
    return [{ name: state.country.name, href: buildLocationUrl(state.country) }];
  }
  const city = location as City;
  return [{ name: city.country.name, href: buildLocationUrl(city.country) }, { name: city.state.name, href: buildLocationUrl(city.state) }];
}
