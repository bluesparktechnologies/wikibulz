import { InfoPage } from "@/components/blog/info-page";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "Write For Us", description: "Write for Wikibulz. Submit practical local guide ideas that help readers compare city services.", path: "/write-for-us", index: true });

export default function WriteForUsPage() {
  return <InfoPage eyebrow="Contribute" title="Write For Wikibulz" description="We welcome practical, original local guide ideas that help readers compare services in their city." sections={[
    { title: "Accepted Topics", body: "Strong submissions explain a specific local service category clearly and help readers make better comparison decisions.", items: ["Healthcare services", "Coaching institutes", "Business service agencies", "Home services", "Food and dining", "Real estate"] },
    { title: "Editorial Rules", body: "Submissions should be original, useful, source-aware, and written in plain English. We do not accept copied content, unsupported claims, keyword stuffing, or promotional articles disguised as neutral advice." },
    { title: "How To Pitch", body: "Send a short pitch to editorial@wikibulz.com with your topic, target reader, outline, source links, and author bio." },
  ]} cta={{ label: "Contact Editorial", href: "/contact" }} />;
}
