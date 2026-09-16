import { InfoPage } from "@/components/blog/info-page";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "Privacy Policy", description: "WikiBulz privacy policy for readers, newsletter subscribers, analytics, cookies, and contact information.", path: "/privacy-policy", index: true });

export default function PrivacyPolicyPage() {
  return <InfoPage eyebrow="Privacy" title="Privacy Policy" description="This privacy policy explains how WikiBulz handles basic reader, newsletter, analytics, and contact information." sections={[
    { title: "Information We Collect", body: "We may collect information you provide directly, such as email addresses for newsletter subscriptions or contact messages. We may also use basic analytics to understand page performance and improve content." },
    { title: "How Information Is Used", body: "Information is used to deliver newsletters, respond to inquiries, improve article coverage, protect the website, and understand which technology topics readers find useful." },
    { title: "Cookies And Analytics", body: "The site may use cookies or privacy-conscious analytics tools for performance, security, and audience measurement. You can control cookies through your browser settings." },
    { title: "Contact", body: "For privacy questions, contact contact@wikibulz.com." },
  ]} />;
}
