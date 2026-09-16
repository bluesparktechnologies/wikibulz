import { InfoPage } from "@/components/blog/info-page";
import { NewsletterForm } from "@/components/newsletter-form";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "WikiBulz Newsletter", description: "Subscribe to the WikiBulz newsletter for useful explainers and practical guides delivered weekly.", path: "/newsletter", index: false });

export default function NewsletterPage() {
  return <InfoPage eyebrow="Newsletter" title="Get The Weekly Guide" description="Subscribe for useful explainers and practical guides from WikiBulz." sections={[
    { title: "What You Get", body: "The newsletter highlights practical stories and explainers that help readers track important technology changes without reading every headline.", items: ["AI updates", "Cybersecurity notes", "Software trends", "Cloud tools", "SEO technology", "Startup stories"] },
    { title: "For Busy Readers", body: "Each brief is designed for people who need signal, not noise: founders, marketers, developers, SEO teams, and digital business owners." },
  ]}>
    <section className="mt-5 rounded-lg border border-[var(--line)] bg-white p-6">
      <h2 className="text-2xl font-black">Subscribe to the brief</h2>
      <p className="mt-3 leading-7 text-[var(--muted)]">Enter your email to receive the weekly technology brief.</p>
      <NewsletterForm variant="light" />
    </section>
  </InfoPage>;
}
