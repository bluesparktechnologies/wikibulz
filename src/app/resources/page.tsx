import { InfoPage } from "@/components/blog/info-page";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "Local Guide Resources", description: "Browse Wikibulz resources for comparing local services, city categories, and ranking methodology.", path: "/resources", index: false });

export default function ResourcesPage() {
  return <InfoPage eyebrow="Resources" title="Local Guide Resources" description="Practical checklists and notes for comparing local services with more confidence." sections={[
    { title: "Comparison Checklists", body: "Future resources will help readers compare clinics, coaching institutes, agencies, restaurants, home services, and other local providers." },
    { title: "Ranking Methodology", body: "Resources explain how editors can consider reputation, public sentiment, trust signals, accessibility, pricing clarity, and service fit." },
    { title: "City Discovery Paths", body: "Resources will connect related Wikibulz articles into city and category paths for readers comparing local options." },
  ]} />;
}
