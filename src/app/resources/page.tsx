import { InfoPage } from "@/components/blog/info-page";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "Guides And Resources", description: "Browse WikiBulz resources and practical guides for money, technology, everyday skills, and online research.", path: "/resources", index: false });

export default function ResourcesPage() {
  return <InfoPage eyebrow="Resources" title="Technology Resources And Tools" description="A practical hub for tool guides, explainers, checklists, and resources connected to modern technology work." sections={[
    { title: "Tool Guides", body: "Future resources will cover software tools, AI apps, cloud services, SEO platforms, analytics workflows, and security basics." },
    { title: "Checklists", body: "Useful checklists help readers compare tools, prepare migrations, improve website performance, and review basic digital security habits." },
    { title: "Learning Paths", body: "Resources will connect related WikiBulz articles into beginner-friendly paths across money, technology, everyday skills, and online research." },
  ]} />;
}
