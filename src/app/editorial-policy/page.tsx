import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({
  title: "Editorial Policy",
  description: "Wikibulz editorial standards for sourcing, authorship, updates, and transparent local rankings.",
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return <><SiteHeader /><main className="prose-content mx-auto max-w-3xl px-5 py-10"><h1>Editorial Policy</h1><p>Wikibulz articles should be useful, source-aware, and transparent about authorship. Editors should avoid fabricated credentials, fake freshness, unsupported ratings, or misleading claims.</p><h2>Sourcing</h2><p>Articles may use public business information, official websites, public review patterns, direct editorial research, and credible references. Important claims should be supported in the article where practical.</p><h2>Authorship And Review</h2><p>Author, reviewer, and fact-checker fields must reflect real editorial assignments. Optional reviewer or credential fields should stay empty unless verified by the team.</p><h2>Updates</h2><p>Ranking and guide content should be reviewed when public information changes, when readers report an issue, or when editors identify better evidence.</p></main><Footer /></>;
}
