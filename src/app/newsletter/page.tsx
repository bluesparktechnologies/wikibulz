import { InfoPage } from "@/components/blog/info-page";
import { NewsletterForm } from "@/components/newsletter-form";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "Wikibulz Newsletter", description: "Subscribe to Wikibulz for new local ranking guides, city launches, and methodology updates.", path: "/newsletter", index: false });

export default function NewsletterPage() {
  return <InfoPage eyebrow="Newsletter" title="Get New Local Guides" description="Subscribe for new city rankings, category launches, and editorial updates from Wikibulz." sections={[
    { title: "What You Get", body: "The newsletter highlights fresh local service guides and useful comparison updates.", items: ["New city guides", "Healthcare rankings", "Education guides", "Agency comparisons", "Methodology updates", "Correction notices"] },
    { title: "For Busy Readers", body: "Each brief is designed for people comparing local services who need clear signals, not a pile of search results." },
  ]}>
    <section className="mt-5 rounded-lg border border-[var(--line)] bg-white p-6">
      <h2 className="text-2xl font-black">Subscribe to the brief</h2>
      <p className="mt-3 leading-7 text-[var(--muted)]">Enter your email to receive new Wikibulz local guide updates.</p>
      <NewsletterForm variant="light" />
    </section>
  </InfoPage>;
}
