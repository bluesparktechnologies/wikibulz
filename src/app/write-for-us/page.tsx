import { InfoPage } from "@/components/blog/info-page";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "Write For Us", description: "Write for WikiBulz. Submit practical, original guide ideas that help readers understand the world around them.", path: "/write-for-us", index: true });

export default function WriteForUsPage() {
  return <InfoPage eyebrow="Contribute" title="Write For WikiBulz" description="We welcome practical, original explainer and guide ideas that help readers understand tools, trends, decisions, and everyday topics." sections={[
    { title: "Accepted Topics", body: "Strong submissions explain a specific technology topic clearly and help readers make better decisions.", items: ["AI tools and adoption", "Cybersecurity basics", "Software workflows", "Cloud platforms", "Startup technology", "SEO technology"] },
    { title: "Editorial Rules", body: "Submissions should be original, useful, source-aware, and written in plain English. We do not accept copied content, unsupported claims, keyword stuffing, or promotional articles disguised as neutral advice." },
    { title: "How To Pitch", body: "Send a short pitch to editorial@wikibulz.com with your topic, target reader, outline, source links, and author bio." },
  ]} cta={{ label: "Contact Editorial", href: "/contact" }} />;
}
