import { InfoPage } from "@/components/blog/info-page";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "Advertise With Wikibulz", description: "Advertise with Wikibulz to reach readers comparing local services and city options.", path: "/advertise", index: true });

export default function AdvertisePage() {
  return <InfoPage eyebrow="Advertise" title="Advertise With Wikibulz" description="Reach readers who are actively comparing local services, city categories, and practical business options." sections={[
    { title: "Audience", body: "Wikibulz is built for readers who want clear, practical information they can use in local decisions.", items: ["Local service seekers", "Families", "Students", "Small business owners", "Independent professionals"] },
    { title: "Opportunities", body: "Advertising options may include clearly labeled sponsorships, newsletter mentions, category sponsorships, and display placements where appropriate." },
    { title: "Brand Safety", body: "Sponsored content should be relevant, clearly labeled, and useful to readers. We avoid misleading claims, fake urgency, and unsupported guarantees." },
  ]} cta={{ label: "Contact Partnerships", href: "/contact" }} />;
}
