import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { PastedPageContent } from "@/components/site/pasted-page-content";
import { JsonLd } from "@/components/seo/json-ld";
import { seoConfig } from "@/config/seo";
import { aboutPageSchema } from "@/lib/seo/schema";
import { generateStaticMetadata } from "@/lib/seo/metadata";
import { aboutPageText } from "@/lib/site-page-text";

export const metadata = generateStaticMetadata({
  title: "About Wikibulz",
  description: "Learn how Wikibulz helps readers research and compare local businesses, professionals, services, and places.",
  path: "/about",
  index: true,
});

const h2 = [
  "What does Wikibulz have?",
  "What makes Wikibulz different?",
  "How we rank research",
  "We don’t rank based on ratings alone",
  "Editorial independence",
  "What we think about AI",
  "Accuracy matters",
  "Things with higher impact",
  "Our authors / editorial team",
  "Corrections and updates",
  "Ranking can change",
  "What we don’t promise",
  "Our mission",
];

const h3 = [
  "Healthcare (examples of what we can cover)",
  "Education (what we can research and compare)",
  "Business / Professional services",
  "Food/Home/Lifestyle/Travel etc.",
  "Which things you can compare",
  "What are the important factors",
  "What are the key differences",
  "What do you need to know before choosing a provider",
  "General qualifications",
  "Specialization qualifications",
  "Professional experience (if it’s documented publicly)",
  "Patient feedback signals",
  "Provider published claims",
];

export default function AboutPage() {
  return <><SiteHeader /><JsonLd data={aboutPageSchema()} /><main>
    <section className="border-b border-[var(--line)] bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">About Wikibulz</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.04] md:text-7xl">Easier to understand local discovery</h1>
        <p className="mt-7 max-w-2xl text-xl leading-9 text-[var(--muted)]">Wikibulz is a platform for local discovery and comparison. We work to make your choices better.</p>
        <p className="mt-3 text-sm text-[var(--muted)]">Publishing since {seoConfig.siteFoundedYear}. See our <a href={seoConfig.siteHistory.homepageArchive} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">2017 homepage snapshot</a> and an <a href={seoConfig.siteHistory.articleArchive} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">archived article on property costs across eight cities</a>.</p>
      </div>
    </section>
    <article className="prose-content mx-auto max-w-3xl px-5 py-10">
      <PastedPageContent text={aboutPageText} title="Easier to understand local discovery" h2={h2} h3={h3} />
    </article>
  </main><Footer /></>;
}
