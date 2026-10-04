import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({
  title: "How We Rank",
  description: "How Wikibulz researches, evaluates, and updates local ranking articles.",
  path: "/how-we-rank",
});

const factors = [
  "Reputation and public review sentiment",
  "Experience, services offered, and specialization",
  "Trust signals, public credentials, and digital presence",
  "Pricing transparency, accessibility, and customer experience",
  "Editorial research, source quality, and update freshness",
];

export default function HowWeRankPage() {
  return <><SiteHeader /><main className="mx-auto max-w-3xl px-5 py-10"><p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Editorial methodology</p><h1 className="mt-3 text-5xl font-black">How We Rank</h1><p className="mt-5 text-lg leading-8 text-[var(--muted)]">Wikibulz rankings are editorial guides built to help readers compare local options. We do not invent credentials, ratings, or review scores. When a ranking uses a score, it should be manually reviewed and supported by the article context.</p><section className="mt-8 grid gap-4">{factors.map((factor) => <div key={factor} className="rounded-lg border border-[var(--line)] bg-white p-4 font-semibold">{factor}</div>)}</section><section className="prose-content mt-10"><h2>Selection Process</h2><p>Editors may consider public business information, reputation signals, review patterns, service coverage, accessibility, pricing clarity, and visible trust indicators. Ranking criteria can vary by category, so articles should explain important category-specific factors when they matter.</p><h2>Updates And Corrections</h2><p>Rankings should be refreshed when public information changes, when readers or businesses report a possible issue, or when editors identify better sources. Corrections should be handled transparently without fabricating reviewer identities or professional credentials.</p><h2>Advertising Independence</h2><p>Advertising or partnership interest should not guarantee placement in a ranking article. Editorial pages should disclose sponsored relationships where applicable.</p></section></main><Footer /></>;
}
