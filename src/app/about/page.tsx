import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "About Wikibulz", description: "Learn about Wikibulz, a local rankings and discovery platform for city-wise service comparisons.", path: "/about", index: true });

const coverage = [
  { number: "01", title: "Healthcare", body: "City guides for clinics, doctors, hospitals, dental care, and wellness services.", href: "/category/healthcare" },
  { number: "02", title: "Education", body: "Comparisons for coaching institutes, schools, preschools, and exam preparation services.", href: "/category/education" },
  { number: "03", title: "Business Services", body: "Agency and firm guides for SEO, digital marketing, accounting, legal, and web services.", href: "/category/business-services" },
  { number: "04", title: "Food, Home, Travel, And More", body: "Expandable city categories for the local services readers compare most often.", href: "/blog" },
];

const standards = [
  "No fabricated credentials, ratings, or review scores",
  "Clear links between place, service, and guide",
  "Published dates, update dates, and author attribution",
  "Methodology that explains why factors matter",
];

export default function AboutPage() {
  return <><SiteHeader /><main>
    <section className="border-b border-[var(--line)] bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">About Wikibulz</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.04] tracking-tight md:text-7xl">Local rankings made easier to understand.</h1>
        <p className="mt-7 max-w-2xl text-xl leading-9 text-[var(--muted)]">Wikibulz helps readers compare local services through researched city guides, practical service pages, and transparent editorial methodology.</p>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-14 md:py-20">
      <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">What we cover</p><h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">The service areas behind the site.</h2><p className="mt-4 max-w-sm leading-8 text-[var(--muted)]">Wikibulz grows place by place and service by service, with useful guides instead of empty pages.</p></div>
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">{coverage.map((item) => <Link key={item.title} href={item.href} className="group grid gap-3 py-5 sm:grid-cols-[52px_1fr_auto] sm:items-start"><span className="text-sm font-black text-[var(--accent)]">{item.number}</span><span><span className="block text-xl font-black group-hover:text-[var(--brand)]">{item.title}</span><span className="mt-1 block max-w-xl text-sm leading-7 text-[var(--muted)]">{item.body}</span></span><ArrowUpRight size={18} className="hidden text-[var(--brand)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:block" /></Link>)}</div>
      </div>
    </section>
    <section className="border-y border-[var(--line)] bg-[#edf5f1]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[.7fr_1.3fr] md:py-20">
        <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">Our promise</p><h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Rankings should be useful, not mysterious.</h2><p className="mt-4 max-w-sm leading-8 text-[var(--muted)]">A guide should help readers understand what was compared, what remains uncertain, and which checks they should still do themselves.</p></div>
        <div className="grid gap-3 sm:grid-cols-2">{standards.map((standard) => <p key={standard} className="flex gap-2 rounded-lg border border-[#c9ddd5] bg-white p-4 text-sm font-bold text-[#2f4c43]"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[var(--brand)]" />{standard}</p>)}</div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-14 md:py-20">
      <div className="flex flex-col gap-6 rounded-lg border border-[var(--line)] bg-white px-6 py-8 shadow-sm sm:px-10 md:flex-row md:items-center md:justify-between">
        <div><p className="text-2xl font-black tracking-tight md:text-3xl">Want to understand our process?</p><p className="mt-2 max-w-2xl leading-7 text-[var(--muted)]">Read the methodology page or send the team a correction, lead, or useful local update.</p></div>
        <div className="flex flex-wrap gap-3"><Link href="/how-we-rank" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md bg-[var(--brand)] px-5 py-3 text-sm font-black text-white hover:bg-[var(--brand-strong)]">How we rank <ArrowUpRight size={16} /></Link><Link href="/contact" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-5 py-3 text-sm font-black text-[var(--foreground)] hover:border-[var(--brand)]">Contact us <ArrowUpRight size={16} /></Link></div>
      </div>
    </section>
  </main><Footer /></>;
}
