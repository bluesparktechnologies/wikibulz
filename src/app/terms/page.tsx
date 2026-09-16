import { InfoPage } from "@/components/blog/info-page";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "Terms And Disclaimer", description: "Terms and disclaimer for WikiBulz readers, including informational content, external links, and editorial limitations.", path: "/terms", index: true });

export default function TermsPage() {
  return <InfoPage eyebrow="Terms" title="Terms And Disclaimer" description="These terms explain how readers should use WikiBulz content and what limits apply to published information." sections={[
    { title: "Informational Content", body: "Articles on WikiBulz are published for general information and education. They are not legal, financial, medical, security, or professional advice." },
    { title: "Accuracy And Updates", body: "Technology changes quickly. We aim to keep content useful and accurate, but product details, prices, policies, and availability can change after publication." },
    { title: "External Links", body: "Articles may link to third-party websites. WikiBulz is not responsible for external content, policies, or availability." },
    { title: "Sponsored Content", body: "If sponsored posts or advertising are published, they should be clearly identified so readers can understand the relationship." },
  ]} />;
}
