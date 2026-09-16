import { seoConfig } from "../src/config/seo";
import { redirects } from "../src/lib/content/sample-data";
import { validateRedirect } from "../src/services/redirects";
const failures: string[] = [];
if (!seoConfig.siteUrl.startsWith("http")) failures.push("SITE_URL must be an absolute URL");
if (!seoConfig.organization.name) failures.push("Organization name is required");
for (const redirect of redirects) failures.push(...validateRedirect(redirect, redirects).map((warning) => redirect.sourcePath + ": " + warning));
if (failures.length) { console.error("SEO validation failed"); for (const failure of failures) console.error("- " + failure); process.exit(1); }
console.log("SEO validation passed: site URL, organization settings, and redirects are valid.");
