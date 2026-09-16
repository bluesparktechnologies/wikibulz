import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const articles = [
  {
    title: "What Modern Web Platform Changes Mean for Everyday Users",
    category: "Technology News",
    image: { url: "/images/editorial/web-platform.svg", alt: "Laptop displaying a modern web development workspace", width: 1600, height: 900 },
    focusKeyword: "web platform changes",
    excerpt: "A practical guide to understanding browser and web platform updates without getting lost in release notes or technical jargon.",
    metaDescription: "Learn how web platform changes affect browsers, websites, accessibility, privacy, and everyday digital experiences.",
    tags: ["Web Platform", "Browsers", "Digital Trends"],
    source: { title: "MDN Web Platform", url: "https://developer.mozilla.org/en-US/docs/Web", publisher: "MDN Web Docs" },
    content: `<p>Web platform changes rarely arrive as one dramatic event. They usually appear as a series of browser updates, new standards, improved accessibility features, and changes to the APIs that websites use. For readers, the practical effect is simple: websites can become faster, safer, easier to use, or more capable without requiring a new app.</p><h2 id="what-changes-first">What usually changes first</h2><p>Browser engines are constantly adding support for web capabilities such as better media handling, improved layout controls, stronger privacy protections, and more reliable device features. Developers may notice these changes in documentation before users notice them on screen. A site may load more efficiently, support a new interaction, or behave more consistently across phones and desktops.</p><p>The important point is that browser support is not identical everywhere. A feature can be available in one browser and still require a fallback in another. Good products therefore test the main user journeys, check compatibility data, and keep a usable experience for people on older devices.</p><h2 id="why-it-matters">Why it matters to users</h2><p>Platform improvements affect everyday actions: reading an article, filling out a form, watching a video, signing in, or using a site with assistive technology. Privacy changes can alter how tracking works. Accessibility changes can make navigation clearer. Performance improvements can reduce the time and data needed to load a page on a mobile connection.</p><p>For businesses, the best response is not to chase every new API. Teams should first identify the parts of the experience that matter most, measure them on real devices, and adopt new capabilities when they improve a clear user problem.</p><h2 id="a-practical-checklist">A practical checklist</h2><ul><li>Test critical journeys in the browsers your audience actually uses.</li><li>Use progressive enhancement so a missing feature does not break the page.</li><li>Check keyboard navigation, contrast, labels, and responsive behavior.</li><li>Measure performance before and after adopting a platform feature.</li></ul><p>Web platform progress is most useful when it disappears into a better experience. Readers do not need to know which API powered a smoother interaction; they need the page to work reliably wherever they are.</p>`
  },
  {
    title: "How to Evaluate AI Tools Before Adding Them to a Team Workflow",
    category: "Artificial Intelligence",
    image: { url: "/images/editorial/ai-tools.svg", alt: "Abstract artificial intelligence illustration on a computer screen", width: 1600, height: 900 },
    focusKeyword: "evaluate AI tools",
    excerpt: "A decision framework for testing AI software against real work, data protection needs, reliability, and measurable team outcomes.",
    metaDescription: "Use this practical framework to evaluate AI tools for workflow fit, reliability, privacy, cost, and team adoption.",
    tags: ["Artificial Intelligence", "Productivity", "Team Workflows"],
    source: { title: "AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", publisher: "NIST" },
    content: `<p>Choosing an AI tool should begin with a work problem, not a feature list. A team may want faster research, better customer support, automated summaries, or help with repetitive analysis. The right tool is the one that improves a defined workflow while keeping its limitations visible.</p><h2 id="start-with-the-work">Start with the work</h2><p>Write down the task as it exists today. Who performs it? What information is needed? How often does it happen? What does a good result look like? This baseline prevents a vague AI experiment from becoming a permanent subscription without evidence that it helps.</p><p>Next, separate low-risk assistance from decisions that require expert review. Drafting an outline is different from approving a financial recommendation, changing production code, or responding to a security incident. The higher the consequence of an error, the stronger the review and logging process should be.</p><h2 id="test-reliability">Test reliability, not just impressive demos</h2><p>Run a small evaluation set made from real, representative examples. Track accuracy, missing context, inappropriate confidence, formatting errors, and the time a human spends correcting the output. An AI tool that creates a fast first draft may still be useful even when it is not suitable for final decisions.</p><p>Teams should also test what happens when the input is incomplete or ambiguous. Reliable workflows define when the system must stop, request clarification, or send the work to a human reviewer.</p><h2 id="check-data-and-costs">Check data handling and costs</h2><p>Before connecting company information, review the provider's data controls, retention terms, access permissions, and administrator settings. Limit the data shared with the tool to what the task needs. Cost should include usage, integration, monitoring, training, and the human time needed to review results.</p><h2 id="pilot-and-measure">Pilot with a clear exit rule</h2><ul><li>Choose one workflow and one accountable owner.</li><li>Define quality, time, and risk metrics before the pilot.</li><li>Keep a human approval step for consequential outputs.</li><li>Review the results with the people who do the work every day.</li></ul><p>AI adoption becomes sustainable when the tool fits the workflow and the team understands when not to trust it. A measured pilot produces a better decision than a broad rollout driven by novelty.</p>`
  },
  {
    title: "A Practical Passkey Checklist for Small Teams",
    category: "Cybersecurity",
    image: { url: "/images/editorial/passkey-security.svg", alt: "Security lock representing passkey and account protection", width: 1600, height: 900 },
    focusKeyword: "passkey security checklist",
    excerpt: "What small teams should review before adding passkeys, including account recovery, device changes, administrator controls, and user support.",
    metaDescription: "Use this passkey security checklist to plan enrollment, recovery, device changes, administration, and user support.",
    tags: ["Cybersecurity", "Passkeys", "Account Security"],
    source: { title: "Passkeys", url: "https://fidoalliance.org/passkeys/", publisher: "FIDO Alliance" },
    content: `<p>Passkeys can make sign-in simpler while reducing dependence on passwords, but a successful rollout involves more than enabling a button. Small teams need a plan for enrollment, recovery, device replacement, administrator access, and users who work across multiple devices.</p><h2 id="map-the-account-journey">Map the account journey</h2><p>Document how a person creates an account, adds a passkey, signs in from a new device, and recovers access after losing a phone or security key. The recovery path deserves the same attention as the normal sign-in path. If recovery is weak, attackers may target it instead of the passkey.</p><p>Make the instructions clear for both technical and non-technical users. Explain which devices can be used, what happens when a device is replaced, and how a user should contact the organization if something looks wrong.</p><h2 id="protect-admin-access">Protect administrator access</h2><p>Privileged accounts should have stronger controls than ordinary accounts. Keep administrator accounts separate from daily personal accounts, review who can reset access, and record important changes. Where the service supports it, use multiple administrators so the organization is not dependent on one person's device.</p><h2 id="test-recovery">Test recovery before rollout</h2><p>A pilot should include real device changes and failure scenarios. Test a lost phone, a new laptop, an unavailable authenticator, and a user who cannot complete enrollment. The goal is not only to prove that sign-in works; it is to prove that the organization can recover access without creating a shortcut around security.</p><h2 id="rollout-checklist">Rollout checklist</h2><ul><li>Start with a small group and collect support questions.</li><li>Publish recovery instructions before making enrollment mandatory.</li><li>Review account recovery permissions and audit logs.</li><li>Keep an approved fallback for exceptional cases, with extra verification.</li><li>Remove old access methods when the migration is complete.</li></ul><p>Passkeys are strongest when they are part of a complete identity process. Good preparation makes the security improvement easier for users to adopt and easier for a small team to operate.</p>`
  },
  {
    title: "API Versioning Strategies for Growing Software Products",
    category: "Software",
    image: { url: "/images/editorial/api-software.svg", alt: "Software code on a monitor for an API development workflow", width: 1600, height: 900 },
    focusKeyword: "API versioning strategy",
    excerpt: "A practical comparison of URL, header, and date-based API versioning, with migration rules for teams that need dependable integrations.",
    metaDescription: "Compare API versioning strategies and learn how to plan compatibility, deprecation, documentation, and migrations.",
    tags: ["Software", "APIs", "Developer Tools"],
    source: { title: "API Design Guidance", url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design", publisher: "Microsoft Learn" },
    content: `<p>API versioning is a product decision as much as an engineering decision. A public API may be used by customer applications, internal services, scripts, and partners that update on different schedules. A versioning strategy gives those consumers a predictable way to adopt changes without breaking existing work.</p><h2 id="choose-a-visible-contract">Choose a visible contract</h2><p>Common approaches include putting a version in the URL, sending it in a header, or using a date-based version. URL versions are easy to understand and debug. Header versions keep the URL cleaner but require clients and tools to preserve the header. Date-based versions can communicate a time boundary, but they need clear documentation so consumers understand what changes between releases.</p><p>The best choice is the one the team can apply consistently. A sophisticated scheme is not useful if documentation, SDKs, tests, and support processes do not follow it.</p><h2 id="define-breaking-change">Define a breaking change</h2><p>Changing a required field, removing an endpoint, changing an error contract, or altering the meaning of a response can break a client even when the server still returns a successful status. Teams should define these cases before implementation begins. Additive changes are often safer, but even a new required behavior can surprise consumers.</p><h2 id="plan-deprecation">Plan deprecation as a product workflow</h2><p>When a version must be retired, publish a migration guide, identify affected consumers, announce a timeline, and measure usage of the old version. Deprecation should not be a single warning added at the last moment. Give teams enough time to test, update, and release their clients.</p><h2 id="operational-checklist">Operational checklist</h2><ul><li>Document supported versions and their end dates.</li><li>Keep contract tests for every supported version.</li><li>Return clear error messages with stable error fields.</li><li>Monitor traffic by version and consumer where possible.</li><li>Make migration examples available before the old version is retired.</li></ul><p>Good API versioning reduces surprise. It lets a product evolve while giving developers a clear contract they can trust.</p>`
  },
  {
    title: "Technical SEO Checks for a New Content Site",
    category: "Technical SEO",
    image: { url: "/images/editorial/technical-seo.svg", alt: "Analytics dashboard used to review website performance and SEO", width: 1600, height: 900 },
    focusKeyword: "technical SEO checklist",
    excerpt: "A launch-ready technical SEO checklist covering crawlability, canonicals, sitemaps, structured data, performance, and internal links.",
    metaDescription: "Run this technical SEO checklist before launching a content site: crawlability, canonicals, sitemaps, schema, links, and performance.",
    tags: ["Technical SEO", "Crawlability", "Structured Data"],
    source: { title: "SEO Starter Guide", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", publisher: "Google Search Central" },
    content: `<p>A new content site does not need a complicated SEO stack to be crawlable. It needs clear URLs, useful pages, reliable internal links, accurate metadata, and a technical foundation that search engines and people can access. A launch checklist helps catch small problems before they multiply across hundreds of pages.</p><h2 id="check-crawlability">Check crawlability first</h2><p>Review robots.txt, response codes, redirect behavior, and the pages included in the XML sitemap. Make sure important pages are reachable through normal links and are not blocked by an accidental rule. Search and preview pages should follow a deliberate indexing policy instead of being generated without control.</p><h2 id="review-canonicals">Review canonical URLs</h2><p>Each indexable article should have one preferred URL. Check HTTP and HTTPS, www and non-www behavior, trailing slashes, query parameters, and old URL redirects. A redirect should point directly to the final canonical URL, not through several intermediate locations.</p><h2 id="improve-page-quality">Improve page quality signals</h2><p>Titles and descriptions should describe the actual page. Headings should make the document structure clear. Images need useful alternative text when they communicate information. Structured data should match visible content and should be removed when the page no longer supports it.</p><h2 id="build-internal-links">Build useful internal links</h2><p>Link related articles where the connection helps the reader. Category pages should link to their articles, and important evergreen pages should not depend on a single temporary homepage placement. Avoid automated links that repeat the same anchor text or point to unrelated pages.</p><h2 id="launch-checklist">Launch checklist</h2><ul><li>Test representative pages on mobile and desktop.</li><li>Confirm sitemap and robots URLs return the correct content type.</li><li>Validate canonical tags, redirects, breadcrumbs, and schema.</li><li>Check that empty categories and thin tag pages do not create indexable sprawl.</li><li>Monitor crawl errors and real user performance after launch.</li></ul><p>Technical SEO is mostly disciplined publishing infrastructure. A clean system makes useful content easier to discover without forcing keywords into every sentence.</p>`
  },
  {
    title: "How to Compare Index Funds Beyond the Expense Ratio",
    category: "Investing",
    image: { url: "/images/editorial/index-funds.svg", alt: "Financial charts and calculator for comparing investment funds", width: 1600, height: 900 },
    focusKeyword: "compare index funds",
    excerpt: "A clear framework for comparing index funds by objective, diversification, tracking quality, liquidity, taxes, and account fit.",
    metaDescription: "Learn how to compare index funds using cost, diversification, tracking difference, liquidity, taxes, and account fit.",
    tags: ["Investing", "Index Funds", "Portfolio Planning"],
    source: { title: "Mutual Funds and ETFs", url: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-funds-etfs", publisher: "Investor.gov" },
    content: `<p>Expense ratio is an important number, but it is not the whole decision when comparing index funds. Two funds can follow similar markets while differing in holdings, tracking quality, liquidity, tax characteristics, and how well they fit an investor's account and time horizon.</p><h2 id="start-with-the-index">Start with the index</h2><p>First identify what the fund is designed to track. A broad-market fund, a large-company fund, a sector fund, and an international fund can all be called index funds while carrying very different concentration and diversification profiles. The index methodology explains what enters the portfolio and how often it changes.</p><h2 id="compare-costs-and-tracking">Compare costs and tracking</h2><p>Look beyond the stated expense ratio and review how closely the fund has followed its benchmark after costs. Tracking difference can reflect fees, trading costs, portfolio sampling, cash holdings, and the timing of rebalancing. Historical results do not guarantee future performance, but they can reveal how the fund behaves relative to its stated objective.</p><h2 id="check-liquidity-and-fit">Check liquidity and account fit</h2><p>Trading volume, bid-ask spreads, minimums, and availability can matter, especially for investors making regular contributions or withdrawals. The same investment may also have different tax and account implications depending on where it is held. Read the fund documents and consider whether the product fits the account, not only whether it has a low headline fee.</p><h2 id="avoid-shortcuts">Avoid simple shortcuts</h2><ul><li>Do not choose a fund only because it had the best recent return.</li><li>Do not confuse a low price per share with a lower-cost investment.</li><li>Do not ignore concentration in a narrow sector or theme.</li><li>Do not treat past performance as a promise.</li></ul><p>A useful comparison begins with the investor's goal, then evaluates the fund's structure and costs. When the decision is consequential, use the official prospectus and consider qualified financial advice for personal circumstances.</p>`
  },
];

async function main() {
  const { connectMongo } = await import("../src/lib/db/mongoose");
  const { calculateReadingMinutes, calculateWordCount, ensureHeadingIds, generateTableOfContents } = await import("../src/lib/content/processing");
  const { sanitizeArticleHtml } = await import("../src/lib/seo/analysis");
  const { compactPostSlug, createPublicId, normalizeSlug } = await import("../src/lib/seo/url");
  const { AuthorModel, CategoryModel, PostModel, TagModel } = await import("../src/models/schemas");
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required to publish the editorial set.");

  const author = await AuthorModel.findOneAndUpdate(
    { slug: "bluespark-editorial-team" },
    { name: "Bluespark Editorial Team", slug: "bluespark-editorial-team", email: "editorial@bluespark.in", bio: "The Bluespark editorial team covers practical technology, software, security, SEO, and investing topics.", jobTitle: "Technology Editorial Team", expertise: ["Technology", "Software", "Cybersecurity", "SEO", "Investing"], status: "active" },
    { upsert: true, returnDocument: "after" },
  );

  const published: Array<{ title: string; url: string; status: string }> = [];
  for (const article of articles) {
    const categorySlug = normalizeSlug(article.category);
    const category = await CategoryModel.findOneAndUpdate(
      { slug: categorySlug },
      { name: article.category, slug: categorySlug, description: `${article.category} articles with practical context, clear explanations, and source-backed editorial coverage.`, indexStatus: "index" },
      { upsert: true, returnDocument: "after" },
    );
    const tagIds: string[] = [];
    for (const name of article.tags) {
      const tag = await TagModel.findOneAndUpdate({ slug: normalizeSlug(name) }, { name, slug: normalizeSlug(name), indexStatus: "noindex" }, { upsert: true, returnDocument: "after" });
      tagIds.push(String(tag._id));
    }
    const slug = compactPostSlug(article.focusKeyword, article.title);
    const existing = await PostModel.findOne({ slug }).select("publicId").lean<{ publicId?: string }>();
    const safeContent = ensureHeadingIds(sanitizeArticleHtml(article.content));
    const saved = await PostModel.findOneAndUpdate(
      { slug },
      {
        title: article.title,
        slug,
        publicId: existing?.publicId ?? createPublicId(),
        excerpt: article.excerpt,
        content: safeContent,
        featuredImage: article.image,
        author: author._id,
        category: category._id,
        tags: tagIds,
        status: "published",
        publishedAt: new Date(),
        scheduledAt: null,
        seoTitle: article.title,
        metaDescription: article.metaDescription,
        canonicalUrl: null,
        robotsIndex: true,
        robotsFollow: true,
        focusKeyword: article.focusKeyword,
        secondaryKeywords: article.tags,
        ogTitle: article.title,
        ogDescription: article.metaDescription,
        ogImage: article.image,
        twitterTitle: article.title,
        twitterDescription: article.metaDescription,
        twitterImage: article.image,
        schemaType: "Article",
        featured: false,
        editorPick: false,
        readingTime: calculateReadingMinutes(safeContent),
        wordCount: calculateWordCount(safeContent),
        tableOfContents: generateTableOfContents(safeContent),
        sources: [{ ...article.source, dateAccessed: new Date() }],
        references: [],
        faqs: [],
        reviewedBy: "Bluespark Editorial Team",
        lastReviewedAt: new Date(),
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    published.push({ title: article.title, url: `/${categorySlug}/${slug}-${saved.publicId}`, status: saved.status });
  }
  console.log(JSON.stringify({ published }, null, 2));
}

main().then(() => process.exit(0)).catch((error: unknown) => { console.error(error); process.exit(1); });
