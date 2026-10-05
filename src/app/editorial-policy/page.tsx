import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({
  title: "Editorial Policy",
  description: "Wikibulz editorial standards for sourcing, authorship, rankings, updates, corrections, AI use, and transparent local discovery guides.",
  path: "/editorial-policy",
});

const readerStandards = [
  "Clear answers to real user questions",
  "Practical comparison criteria",
  "Useful context and decision-making guidance",
  "Accurate and verifiable information",
  "Readable, well-structured content",
  "Original analysis and editorial judgment",
];

const avoidStandards = [
  "Keyword stuffing",
  "Unnecessary filler",
  "Exaggerated or sensational claims",
  "Fake expertise",
  "Misleading freshness updates",
  "Mass-produced pages with little original value",
  "Unsupported rankings or ratings",
];

const researchSources = [
  "Official business or professional websites",
  "Government and regulatory sources",
  "Recognized professional directories",
  "Official institutional sources",
  "Verified professional profiles",
  "Public business listings",
  "Public reviews and review patterns",
  "Direct editorial research",
  "Publicly available service, qualification, and location information",
];

const rankingCriteria = [
  "Relevant qualifications or credentials",
  "Specialization",
  "Documented experience",
  "Reputation",
  "Public review patterns",
  "Review volume and consistency",
  "Range of services",
  "Transparency of information",
  "Local presence and accessibility",
  "Professional or institutional signals",
  "Pricing transparency where available",
  "Category-specific factors",
  "Overall strength of available evidence",
];

const reviewSignals = [
  "Number of reviews",
  "Rating consistency",
  "Recency",
  "Written feedback",
  "Treatment or service context",
  "Recurring positive or negative patterns",
];

const healthcareStandards = [
  "Verify qualifications and specialties where reasonably possible",
  "Distinguish general practitioners from relevant specialists",
  "Use reputable and professional sources",
  "Avoid diagnosing individual readers",
  "Avoid guaranteeing treatment outcomes",
  "Avoid unsupported claims that one practitioner is clinically superior to another",
  "Clearly state limitations of our research",
  "Encourage readers to seek appropriate professional advice",
];

const authorFields = [
  "Name",
  "Role",
  "Areas of coverage",
  "Relevant experience",
  "Biography",
  "Published articles",
];

const aiUses = [
  "Organizing research",
  "Structuring drafts",
  "Editing",
  "Summarizing information",
  "Processing data",
  "Identifying areas that require further research",
];

const originalitySignals = [
  "Comparison frameworks",
  "Ranking methodology",
  "Editorial analysis",
  "Local context",
  "Treatment or service-specific guidance",
  "Practical questions readers should ask",
  "Strengths and limitations",
  "Interpretation of publicly available information",
];

const changingInformation = [
  "Business addresses",
  "Phone numbers",
  "Opening hours",
  "Staff members",
  "Qualifications",
  "Services",
  "Pricing",
  "Ratings",
  "Review counts",
  "Business ownership or operating status",
];

const updateTriggers = [
  "Important information changes",
  "A business moves or closes",
  "Credentials or professional roles change",
  "Better evidence becomes available",
  "Readers report an error",
  "Rankings no longer reflect current information",
  "Our editorial methodology improves",
];

const correctionRequestDetails = [
  "The relevant article URL",
  "The information believed to be incorrect",
  "The corrected information",
  "Supporting evidence",
  "An official or authoritative source where available",
];

const businessCorrectionFields = [
  "Name",
  "Address",
  "Website",
  "Phone number",
  "Services",
  "Professional qualifications",
  "Staff information",
  "Opening hours",
];

const rankingChangeReasons = [
  "Stronger evidence becomes available",
  "Qualifications or services change",
  "Public feedback changes significantly",
  "Information becomes outdated",
  "Another option becomes more relevant",
  "Our methodology improves",
];

const outcomeLimits = [
  "Medical outcomes",
  "Professional performance",
  "Service quality",
  "Availability",
  "Pricing",
  "Business results",
  "That one ranked option will be the best choice for every individual",
];

const transparencySignals = [
  "Author information",
  "Reviewer or fact-checker information",
  "Publication date",
  "Last reviewed or updated date",
  "Sources",
  "Ranking methodology",
  "Research limitations",
];

function BulletList({ items }: { items: string[] }) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default function EditorialPolicyPage() {
  return <><SiteHeader /><main className="prose-content mx-auto max-w-3xl px-5 py-10">
    <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Editorial standards</p>
    <h1>Editorial Policy</h1>
    <p>Wikibulz exists to help people make better-informed decisions.</p>
    <p>We publish rankings, comparisons, local discovery guides, and informational content across categories such as healthcare, education, professional services, food, lifestyle, and local businesses.</p>
    <p>Our editorial standards are built around three principles: usefulness for readers, evidence and transparency, and editorial independence.</p>
    <p>We aim to explain not only which businesses, professionals, or services are included, but also why they are included, what evidence we considered, and what limitations readers should keep in mind.</p>

    <h2>People-First Editorial Standards</h2>
    <p>Every Wikibulz article should provide genuine value beyond information that is already easy to find elsewhere.</p>
    <h3>What Our Editors Prioritize</h3>
    <BulletList items={readerStandards} />
    <h3>What We Avoid</h3>
    <p>We avoid publishing content that exists primarily to target keywords without providing meaningful value.</p>
    <BulletList items={avoidStandards} />

    <h2>How We Research Content</h2>
    <p>Wikibulz uses a mix of primary, professional, and publicly available sources depending on the topic.</p>
    <BulletList items={researchSources} />
    <p>Whenever practical, we verify key facts using the most reliable and direct sources available.</p>
    <p>Information published by a business about itself may be useful, but we treat it as first-party information rather than independent proof.</p>

    <h2>How Wikibulz Rankings Work</h2>
    <p>Wikibulz rankings are editorial comparisons designed to help readers create a useful shortlist.</p>
    <p>There is rarely one business or professional that is objectively best for every person.</p>
    <h3>Ranking Criteria</h3>
    <p>Our ranking criteria vary by category, but may include:</p>
    <BulletList items={rankingCriteria} />
    <p>Different factors may carry different weight depending on the subject. For example, in healthcare, relevant specialist qualifications may be more important than simply having the highest star rating.</p>
    <p>We do not rank businesses using a single automated metric.</p>

    <h2>Rankings Are Editorial, Not Pay-to-Win</h2>
    <p>Editorial rankings should remain separate from commercial relationships.</p>
    <p>A business cannot purchase a guaranteed editorial position simply by paying Wikibulz.</p>
    <p>If Wikibulz offers advertising, sponsored placements, featured profiles, or commercial partnerships, they should be clearly distinguishable from independent editorial rankings.</p>
    <p>Paid visibility should never be presented as independent editorial endorsement.</p>

    <h2>Reviews and Ratings</h2>
    <p>Public reviews can provide useful context, but they are only one signal.</p>
    <BulletList items={reviewSignals} />
    <p>A business with a 5.0 rating from a small number of reviews is not automatically considered stronger than a business with a slightly lower rating supported by a much larger review history.</p>
    <p>Wikibulz does not fabricate reviews, testimonials, or ratings.</p>
    <p>Third-party ratings are treated as third-party information and should not be presented as ratings collected directly by Wikibulz.</p>

    <h2>Healthcare and Other High-Impact Topics</h2>
    <p>Healthcare, financial, legal, and other high-impact topics require a higher level of care.</p>
    <h3>Healthcare Content Standards</h3>
    <BulletList items={healthcareStandards} />
    <p>Healthcare rankings and guides on Wikibulz are intended for research, discovery, and comparison purposes only.</p>
    <p>They are not a substitute for diagnosis, treatment, or advice from a qualified healthcare professional.</p>
    <p>For urgent symptoms, severe pain, trauma, or other emergencies, readers should contact an appropriate healthcare provider or emergency service.</p>

    <h2>Authors</h2>
    <p>Where practical, Wikibulz identifies the author or editorial team responsible for an article.</p>
    <BulletList items={authorFields} />
    <p>Author information must be truthful. We do not create fake identities, experience, or professional credentials to make content appear more authoritative.</p>

    <h2>Reviewers and Fact-Checkers</h2>
    <p>Some articles may receive additional review from an editor, fact-checker, or subject-matter expert.</p>
    <p>A person should only be listed as reviewed by, fact-checked by, medically reviewed by, or expert reviewed by when they actually performed that role.</p>
    <p>Professional credentials should be verified before publication. We only mention professional review when a suitably qualified person has genuinely reviewed the article.</p>

    <h2>AI and Automation</h2>
    <p>Our editorial team may use AI-assisted tools and automation to support selected parts of research, organization, and content preparation.</p>
    <BulletList items={aiUses} />
    <p>Information produced by AI is never accepted as evidence on its own and must be supported by reliable sources before publication.</p>
    <p>Editorial responsibility remains with Wikibulz.</p>
    <p>Important factual claims should be checked against appropriate sources before publication, particularly for healthcare and other sensitive subjects.</p>
    <p>We do not use AI as a substitute for genuine expertise, verification, or editorial judgment.</p>
    <p>Where the role of automation is significant enough that disclosure would materially help readers understand how content was produced, we may provide additional transparency.</p>

    <h2>Originality and Added Value</h2>
    <p>Wikibulz aims to create content that adds something useful rather than simply repeating information from other websites.</p>
    <BulletList items={originalitySignals} />
    <p>Facts may naturally appear across multiple sources, but our writing, analysis, and editorial structure should remain original.</p>
    <p>We do not knowingly copy substantial sections of third-party content.</p>

    <h2>Accuracy and Verification</h2>
    <p>We aim to publish accurate information based on the best evidence available at the time of research. However, local information can change.</p>
    <BulletList items={changingInformation} />
    <p>Readers should confirm time-sensitive or important details directly with the relevant business or professional before making a decision.</p>

    <h2>Updates and Freshness</h2>
    <p>Content should be updated when there is a meaningful reason to do so.</p>
    <BulletList items={updateTriggers} />
    <p>A new updated date should reflect a genuine review or material change.</p>
    <p>We do not change dates merely to make older content appear newly published.</p>

    <h2>Corrections</h2>
    <p>Accuracy matters to us. If a factual error is identified, we aim to investigate credible evidence and correct the article where appropriate.</p>
    <h3>Useful Correction Requests</h3>
    <BulletList items={correctionRequestDetails} />
    <p>A factual correction does not automatically require a ranking change. Editorial rankings may include judgment as well as factual information.</p>

    <h2>Business and Professional Corrections</h2>
    <p>Businesses and professionals may request updates to factual details such as:</p>
    <BulletList items={businessCorrectionFields} />
    <p>Providing corrected information does not guarantee a higher ranking or preferred placement. Editorial decisions remain independent.</p>

    <h2>Ranking Changes</h2>
    <p>Wikibulz rankings may change over time.</p>
    <BulletList items={rankingChangeReasons} />
    <p>No editorial ranking position is guaranteed permanently.</p>

    <h2>Conflicts of Interest</h2>
    <p>Editors should avoid allowing personal, financial, or commercial relationships to influence editorial decisions.</p>
    <p>Where a meaningful conflict of interest exists, it should be disclosed when appropriate or the content should be handled by another editor.</p>
    <p>Commercial relationships should never be hidden in a way that could mislead readers about editorial independence.</p>

    <h2>Sponsored, Featured, and Affiliate Content</h2>
    <p>Wikibulz may earn revenue through advertising, featured placements, partnerships, or referral relationships.</p>
    <p>When content or placement is sponsored, it should be clearly labeled where appropriate. Possible labels may include Sponsored, Featured, Advertisement, or Paid Partnership.</p>
    <p>Commercial relationships should not automatically determine editorial rankings.</p>

    <h2>No Guaranteed Outcomes</h2>
    <p>Wikibulz helps readers research and compare options.</p>
    <BulletList items={outcomeLimits} />
    <p>Final decisions remain with the reader.</p>

    <h2>Our Commitment to Transparency</h2>
    <p>Where relevant, Wikibulz may show:</p>
    <BulletList items={transparencySignals} />
    <p>Readers should be able to understand who created the content, how the information was evaluated, and where uncertainty remains.</p>
    <p>Our long-term goal is to earn trust by being useful, independent, and transparent, not by making claims we cannot support.</p>

    <h2>Contact the Editorial Team</h2>
    <p>If you find inaccurate, outdated, or incomplete information on Wikibulz, you can contact our editorial team through the official contact page.</p>
    <p>Please include the relevant article URL and supporting information so we can review the issue fairly and efficiently.</p>
  </main><Footer /></>;
}
