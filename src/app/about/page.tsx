import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "About WikiBulz", description: "Learn about WikiBulz, a practical guide site covering money, technology, everyday skills, and how things work.", path: "/about", index: true });

export default function AboutPage() {
  const coverage = [
    { number: "01", title: "Artificial intelligence", body: "The tools and model changes showing up in real products and working routines.", href: "/category/artificial-intelligence" },
    { number: "02", title: "Cybersecurity", body: "The habits, risks, and security decisions that matter beyond a headline.", href: "/category/cybersecurity" },
    { number: "03", title: "Technology news", body: "Product shifts and platform changes explained with the details readers need.", href: "/category/technology-news" },
    { number: "04", title: "Technical SEO", body: "Practical work on crawlability, structured data, performance, and discoverability.", href: "/category/technical-seo" },
    { number: "05", title: "Investing", body: "Plain-language context for the technology and market stories behind long-term decisions.", href: "/category/investing" },
    { number: "06", title: "Retirement", body: "Clear planning explainers for people making careful decisions about the years ahead.", href: "/category/retirement" },
  ];

  const standards = [
    { number: "01", title: "Start with what happened", body: "The opening should tell you what changed, who is affected, and what is still unknown." },
    { number: "02", title: "Add the useful context", body: "We connect the story to the products, teams, and everyday decisions it can actually affect." },
    { number: "03", title: "Leave the reader somewhere useful", body: "A good article should make the next step clearer, whether that means checking a setting or watching a trend." },
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-[var(--line)] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">
            <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">About the publication</p>
                <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.04] tracking-tight md:text-7xl">A working view of technology.</h1>
                <p className="mt-7 max-w-2xl text-xl leading-9 text-[var(--muted)]">WikiBulz is a practical publication about the ideas, tools, decisions, and everyday questions that shape modern life.</p>
              </div>
              <aside className="border-l-4 border-[var(--brand)] bg-[#edf5f1] px-6 py-6">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--accent)]">The short version</p>
                <p className="mt-4 text-lg font-semibold leading-8">We follow the technology people are actually using, then make the important parts easier to understand.</p>
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">What we cover</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">The beats behind the site.</h2>
              <p className="mt-4 max-w-sm leading-8 text-[var(--muted)]">These are the subjects we return to because they keep changing, and because their changes have consequences for real people and teams.</p>
            </div>
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {coverage.map((item) => (
                <Link key={item.title} href={item.href} className="group grid gap-3 py-5 sm:grid-cols-[52px_1fr_auto] sm:items-start">
                  <span className="text-sm font-black text-[var(--accent)]">{item.number}</span>
                  <span>
                    <span className="block text-xl font-black group-hover:text-[var(--brand)]">{item.title}</span>
                    <span className="mt-1 block max-w-xl text-sm leading-7 text-[var(--muted)]">{item.body}</span>
                  </span>
                  <ArrowUpRight size={18} className="hidden text-[var(--brand)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:block" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--line)] bg-[#edf5f1]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[.7fr_1.3fr] md:py-20">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">Our editorial standard</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">What a useful story should do.</h2>
              <p className="mt-4 max-w-sm leading-8 text-[var(--muted)]">We are interested in the detail that helps a reader make sense of a change, not in making every story sound bigger than it is.</p>
            </div>
            <div className="divide-y divide-[#c9ddd5] border-y border-[#c9ddd5]">
              {standards.map((item) => (
                <div key={item.title} className="grid gap-3 py-5 sm:grid-cols-[52px_1fr]">
                  <span className="text-sm font-black text-[var(--accent)]">{item.number}</span>
                  <div>
                    <h3 className="text-xl font-black">{item.title}</h3>
                    <p className="mt-2 max-w-xl leading-7 text-[var(--muted)]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 md:py-20">
          <div className="flex flex-col gap-6 border-l-4 border-[var(--brand)] bg-[#e9f4ef] px-6 py-8 sm:px-10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight md:text-3xl">Have a story worth following?</p>
              <p className="mt-2 max-w-2xl leading-7 text-[var(--muted)]">Read the latest coverage or send the team a correction, idea, or useful lead.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/blog" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md bg-[var(--brand)] px-5 py-3 text-sm font-black text-white hover:bg-[var(--brand-strong)]">Read the blog <ArrowUpRight size={16} /></Link>
              <Link href="/contact" className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md border border-[var(--line)] bg-white px-5 py-3 text-sm font-black text-[var(--foreground)] hover:border-[var(--brand)]">Contact us <ArrowUpRight size={16} /></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
