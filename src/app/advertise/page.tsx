import { InfoPage } from "@/components/blog/info-page";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "Advertise With WikiBulz", description: "Advertise with WikiBulz to reach readers interested in practical guides, technology, money, and everyday learning.", path: "/advertise", index: true });

export default function AdvertisePage() {
  return <InfoPage eyebrow="Advertise" title="Advertise With WikiBulz" description="Reach curious readers through relevant sponsored placements and useful educational content." sections={[
    { title: "Audience", body: "WikiBulz is built for readers who want clear, practical information they can use in everyday decisions.", items: ["Curious readers", "Learners", "Technology users", "Independent professionals", "Small business owners"] },
    { title: "Opportunities", body: "Advertising options may include sponsored articles, newsletter mentions, topic sponsorships, product explainers, and display placements where appropriate." },
    { title: "Brand Safety", body: "Sponsored content should be relevant, clearly labeled, and useful to readers. We avoid misleading claims, fake urgency, and unsupported guarantees." },
  ]} cta={{ label: "Contact Partnerships", href: "/contact" }} />;
}
