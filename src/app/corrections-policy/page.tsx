import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({
  title: "Corrections Policy",
  description: "How Wikibulz reviews correction requests and updates local ranking articles.",
  path: "/corrections-policy",
});

export default function CorrectionsPolicyPage() {
  return <><SiteHeader /><main className="prose-content mx-auto max-w-3xl px-5 py-10"><h1>Corrections Policy</h1><p>Wikibulz aims to correct meaningful errors promptly and transparently. Readers and businesses can contact the editorial team when an article appears outdated, incomplete, or inaccurate.</p><h2>What We Review</h2><p>We may review business details, category fit, author attribution, broken links, outdated information, sourcing issues, and ranking methodology concerns.</p><h2>How Corrections Are Handled</h2><p>Editors evaluate the request, verify available evidence, update the article when appropriate, and refresh the updated date when the change is material.</p><h2>Contact</h2><p>Send correction requests to editorial@wikibulz.com with the page URL and the specific information that needs review.</p></main><Footer /></>;
}
