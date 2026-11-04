import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { PastedPageContent } from "@/components/site/pasted-page-content";
import { editorialPolicyText } from "@/lib/site-page-text";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({
  title: "Editorial Policy",
  description: "Wikibulz standards for people-first content, editorial research, rankings, healthcare, AI, corrections, and independence.",
  path: "/editorial-policy",
});

const h2 = [
  "People First Editorial standards",
  "What our editors care about",
  "What we don't do.",
  "How we research content",
  "How Wikibulz Rankings Work.",
  "Reviews and Ratings.",
  "Healthcare and high impact areas",
  "Authors.",
  "Reviewers and fact checkers",
  "AI and automation.",
  "Originality & Added value.",
  "Accuracy & Verification",
  "Updates & Freshness",
  "Corrections",
  "Business/professional corrections.",
  "Rankings Changes",
  "Conflicts of interest",
  "Sponsored, Featured, Affiliate content.",
  "No guarantees",
  "Our transparency commitment",
  "Contact the editorial team",
];

const h3 = [
  "Editorial Comparisons. They help you create a useful shortlist.",
  "Ranking factors.",
  "Editorial Rankings. Not pay-to-win.",
  "Healthcare content standards.",
];

export default function EditorialPolicyPage() {
  return <><SiteHeader /><main className="prose-content mx-auto max-w-3xl px-5 py-10">
    <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Editorial standards</p>
    <h1>Editorial Policy</h1>
    <PastedPageContent text={editorialPolicyText} title="Editorial Policy" h2={h2} h3={h3} />
  </main><Footer /></>;
}
