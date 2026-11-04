import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { PastedPageContent } from "@/components/site/pasted-page-content";
import { rankingMethodologyText } from "@/lib/site-page-text";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({
  title: "How We Rank",
  description: "Wikibulz ranking methodology, category-specific criteria, editorial research, independence, limitations, and corrections.",
  path: "/how-we-rank",
});

const h2 = [
  "Ranking Philosophy",
  "Considerations",
  "Category Specific Weighting",
  "How we create a ranking",
  "Wikibulz Scores",
  "What doesn't guarantee higher ranking",
  "Editorial Independence",
  "AI and Automation",
  "Ranking Limitations",
  "Updates",
  "Correction / Challenge",
  "Our commitment",
];

const h3 = [
  "Qualifications & Credentials",
  "Experience & Specialization",
  "Reputation & public feedback",
  "Services & Relevance",
  "Transparency & Trust",
  "Local presence & Accessibility",
  "Pricing transparency and value",
  "Digital presence",
  "Quality of source",
  "Healthcare",
  "Restaurants",
  "Coaching Institutes",
  "Professional Services",
  "1. Search intent",
  "2. Set of candidates",
  "3. Verify important information",
  "4. Compare for category relevant signals",
  "5. Editorial judgement",
  "6. Call out important differences",
];

export default function HowWeRankPage() {
  return <><SiteHeader /><main className="prose-content mx-auto max-w-3xl px-5 py-10">
    <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Editorial methodology</p>
    <h1>Ranking Methodologies</h1>
    <PastedPageContent text={rankingMethodologyText} title="Ranking methodologies" h2={h2} h3={h3} />
  </main><Footer /></>;
}
