import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { generateStaticMetadata } from "@/lib/seo/metadata";
import type { ReactNode } from "react";

export const metadata = generateStaticMetadata({
  title: "How We Rank",
  description: "How Wikibulz evaluates local businesses, professionals, services, ranking signals, editorial scores, updates, corrections, and commercial independence.",
  path: "/how-we-rank",
});

const professionalCategories = [
  "Healthcare",
  "Legal services",
  "Financial services",
  "Education",
  "Technical or licensed professions",
];

const experienceSignals = [
  "Years of documented experience",
  "Area of specialization",
  "Breadth or depth of services",
  "Category-specific expertise",
  "Complexity of work handled",
];

const reputationSignals = [
  "Overall rating",
  "Review volume",
  "Recency",
  "Consistency",
  "Written feedback",
  "Recurring positive or negative themes",
  "Whether similar feedback patterns can be found across independent platforms",
];

const relevanceSignals = [
  "Services offered",
  "Specialist services",
  "Treatment areas",
  "Product range",
  "Service depth",
  "Local availability",
  "Suitability for different customer needs",
];

const trustSignals = [
  "Clear business identity",
  "Professional or team information",
  "Qualifications where relevant",
  "Physical location",
  "Contact information",
  "Services",
  "Pricing information",
  "Policies",
  "Official website",
  "Credible professional profiles",
];

const localSignals = [
  "Physical presence in the target city or locality",
  "Proximity to the area being searched",
  "Accessibility",
  "Opening hours",
  "Ease of contact",
  "Whether repeated visits may be required",
];

const valueSignals = [
  "Service quality",
  "Expertise",
  "Inclusions",
  "Transparency",
  "Reliability",
  "Overall fit for the user's needs",
];

const digitalSignals = [
  "Official website quality",
  "Business profile completeness",
  "Consistent contact information",
  "Professional profiles",
  "Service information",
  "Online accessibility",
];

const sourceQuality = [
  "Government or regulatory sources",
  "Official institutional or professional sources",
  "Verified professional profiles",
  "Official business websites",
  "Established third-party platforms",
  "Public business listings and review platforms",
  "Other relevant public sources",
];

const healthcareWeights = [
  "Qualifications",
  "Relevant specialization",
  "Professional registration",
  "Documented experience",
  "Treatment relevance",
  "Transparency",
  "Reliable patient-feedback signals",
];

const restaurantWeights = [
  "Customer feedback",
  "Consistency",
  "Menu relevance",
  "Location",
  "Dining experience",
  "Accessibility",
  "Value",
];

const coachingWeights = [
  "Faculty information",
  "Course coverage",
  "Student support",
  "Track record",
  "Transparency",
  "Local presence",
  "Public feedback",
];

const professionalServiceWeights = [
  "Specialization",
  "Portfolio or case evidence",
  "Experience",
  "Service depth",
  "Reputation",
  "Transparency",
  "Client feedback",
];

const verificationSignals = [
  "Identity",
  "Location",
  "Services",
  "Qualifications",
  "Professional roles",
  "Official website information",
  "Public reputation signals",
];

const rankingArticleExplanations = [
  "Why a business stands out",
  "Who it may be best suited for",
  "Limitations in the available information",
  "What users should verify before choosing",
];

const scoreFactors = [
  "Reputation",
  "Experience",
  "Specialist relevance",
  "Service quality signals",
  "Transparency",
  "Accessibility",
  "Public feedback",
  "Trust signals",
];

const notGuarantees = [
  "Highest Google rating",
  "Largest review count",
  "Strongest SEO",
  "Biggest social following",
  "Most expensive service",
  "Cheapest service",
  "Paid advertising",
  "Partnership with Wikibulz",
  "Requesting a higher rank",
];

const commercialLabels = [
  "Sponsored placements",
  "Advertising",
  "Featured profiles",
  "Paid partnerships",
  "Commercial listings",
];

const updateReasons = [
  "A business closes or moves",
  "Services change",
  "Professional credentials change",
  "Stronger evidence becomes available",
  "Public feedback changes significantly",
  "A new relevant option emerges",
  "Our methodology improves",
];

const correctionDetails = [
  "The relevant article URL",
  "The information in question",
  "The corrected information",
  "Supporting evidence",
  "An official or authoritative source where available",
];

function BulletList({ items }: { items: string[] }) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function SignalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section>
    <h3>{title}</h3>
    {children}
  </section>;
}

export default function HowWeRankPage() {
  return <><SiteHeader /><main className="prose-content mx-auto max-w-3xl px-5 py-10">
    <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Editorial methodology</p>
    <h1>How We Rank</h1>
    <p>Wikibulz rankings are editorial guides designed to help readers compare local businesses, professionals, and services more confidently.</p>
    <p>Our goal is not to declare a universal best based on one number.</p>
    <p>Instead, we look at multiple signals, consider the context of the category, and explain the factors that matter most for the decision.</p>
    <p>A business with the highest star rating is not automatically ranked first. A large review count, famous brand name, or paid partnership does not guarantee a top position either.</p>
    <p>We aim to build rankings that are useful, transparent, evidence-aware, and independent.</p>

    <h2>Our Ranking Philosophy</h2>
    <p>Every category is different.</p>
    <p>The factors that matter for choosing a dentist are not identical to the factors that matter for choosing a restaurant, coaching institute, digital marketing agency, or interior designer.</p>
    <p>That is why Wikibulz does not use one rigid formula for every ranking. Instead, our editors evaluate a combination of general trust signals and category-specific factors.</p>
    <p>The most important question is: which factors would genuinely help a reader make a better decision in this category?</p>

    <h2>What We Consider</h2>
    <p>Depending on the topic, our editorial team may consider the following signals.</p>

    <SignalSection title="Relevant Qualifications and Credentials">
      <p>For categories where professional qualifications matter, we look for publicly available credentials, registrations, certifications, or specialist training.</p>
      <p>This can be especially important in areas such as:</p>
      <BulletList items={professionalCategories} />
      <p>Credentials are considered in context. A qualification alone does not guarantee a top ranking, but relevant specialization may carry significant weight when it directly relates to the reader&apos;s need.</p>
    </SignalSection>

    <SignalSection title="Experience and Specialization">
      <p>We may consider:</p>
      <BulletList items={experienceSignals} />
      <p>Experience is evaluated alongside other factors rather than treated as an automatic ranking advantage.</p>
    </SignalSection>

    <SignalSection title="Reputation and Public Feedback">
      <p>Public reviews can help us understand how a business or professional is perceived.</p>
      <BulletList items={reputationSignals} />
      <p>We do not assume that a 5.0 rating is automatically better than a 4.8 or 4.9 rating. Context matters.</p>
      <p>For example, a slightly lower rating supported by hundreds of reviews may provide a stronger reputation signal than a perfect rating based on a very small sample.</p>
    </SignalSection>

    <SignalSection title="Services and Relevance">
      <p>We evaluate whether a business actually appears relevant to the search intent.</p>
      <BulletList items={relevanceSignals} />
      <p>A business should not rank highly for a service simply because it mentions that service once on a website. Relevance needs to be supported by the broader available evidence.</p>
    </SignalSection>

    <SignalSection title="Trust and Transparency">
      <p>Businesses that make important information easy to verify may receive stronger consideration.</p>
      <BulletList items={trustSignals} />
      <p>Transparency does not guarantee a higher rank, but it can strengthen confidence in the available information.</p>
    </SignalSection>

    <SignalSection title="Local Presence and Accessibility">
      <p>For local rankings, location matters.</p>
      <BulletList items={localSignals} />
      <p>For some categories, expertise may matter more than proximity. In other categories, practical factors such as location, ease of access, or availability may carry more weight.</p>
    </SignalSection>

    <SignalSection title="Pricing Transparency and Value">
      <p>Where relevant, we may consider whether pricing or cost expectations are clearly communicated.</p>
      <p>We do not automatically rank the cheapest option highest. Value depends on factors such as:</p>
      <BulletList items={valueSignals} />
      <p>When reliable pricing information is unavailable, we avoid inventing it.</p>
    </SignalSection>

    <SignalSection title="Digital Presence">
      <p>A business&apos;s online presence can provide supporting context.</p>
      <BulletList items={digitalSignals} />
      <p>Digital presence is only one signal. A better website does not automatically mean a better business.</p>
    </SignalSection>

    <SignalSection title="Source Quality">
      <p>We consider the reliability of the information supporting a ranking. Where possible, we prefer:</p>
      <ol>{sourceQuality.map((item) => <li key={item}>{item}</li>)}</ol>
      <p>Information published by a business about itself may be useful, but it is treated as first-party information rather than independent proof.</p>
    </SignalSection>

    <h2>Category-Specific Weighting</h2>
    <p>Different categories require different priorities.</p>
    <h3>Healthcare</h3>
    <p>We may give more weight to:</p>
    <BulletList items={healthcareWeights} />
    <p>A healthcare provider should not rank first simply because they have more reviews.</p>
    <h3>Restaurants</h3>
    <p>More weight may be placed on:</p>
    <BulletList items={restaurantWeights} />
    <h3>Coaching Institutes</h3>
    <p>Relevant factors may include:</p>
    <BulletList items={coachingWeights} />
    <h3>Professional Services</h3>
    <p>For agencies, consultants, and similar businesses, we may consider:</p>
    <BulletList items={professionalServiceWeights} />
    <p>The exact weighting can vary depending on the search intent.</p>

    <h2>How We Build a Ranking</h2>
    <p>Our process generally follows these steps:</p>
    <h3>1. Define the Search Intent</h3>
    <p>We first identify what a user searching for the topic is actually trying to compare.</p>
    <p>For example, &quot;Best dentist in Bareilly&quot; requires a different evaluation framework from &quot;best implant dentist in Bareilly.&quot;</p>
    <h3>2. Build the Candidate Set</h3>
    <p>We identify relevant businesses or professionals using available public information and credible sources.</p>
    <p>Being discovered during research does not automatically guarantee inclusion.</p>
    <h3>3. Verify Important Information</h3>
    <p>Where practical, we review details such as:</p>
    <BulletList items={verificationSignals} />
    <h3>4. Compare Category-Relevant Signals</h3>
    <p>We compare candidates using the factors that matter most for that specific category.</p>
    <p>We do not use the same weight for every signal.</p>
    <h3>5. Apply Editorial Judgment</h3>
    <p>Rankings are not produced solely by an automated score.</p>
    <p>Editors consider the strength, relevance, and reliability of the available evidence.</p>
    <p>This means a business can rank above another even if it has fewer reviews when stronger category-specific evidence supports that position.</p>
    <h3>6. Explain Important Differences</h3>
    <p>Where useful, ranking articles should explain:</p>
    <BulletList items={rankingArticleExplanations} />
    <p>The purpose is to help readers make a decision, not simply present a numbered list.</p>

    <h2>Wikibulz Scores</h2>
    <p>Some Wikibulz content may include an editorial score.</p>
    <p>When a score is used, it should represent a structured editorial assessment based on relevant criteria.</p>
    <p>Possible factors may include:</p>
    <BulletList items={scoreFactors} />
    <p>Scores should not be randomly generated or presented with false precision.</p>
    <p>If a score cannot be supported by meaningful evidence, we would rather publish a qualitative editorial assessment.</p>

    <h2>What Does Not Guarantee a Higher Ranking</h2>
    <p>None of the following alone guarantees a top position:</p>
    <BulletList items={notGuarantees} />
    <p>Rankings should reflect editorial relevance and available evidence.</p>

    <h2>Editorial Independence</h2>
    <p>A business cannot buy a guaranteed editorial ranking.</p>
    <p>If Wikibulz offers any of the following, they should be clearly distinguishable from independent editorial rankings:</p>
    <BulletList items={commercialLabels} />
    <p>Commercial relationships should not secretly determine ranking positions.</p>

    <h2>AI and Automation</h2>
    <p>Wikibulz may use AI or automation to assist with research organization, data processing, content structuring, or editorial workflows.</p>
    <p>AI does not independently decide who deserves a top ranking. Important ranking decisions should remain subject to editorial review.</p>
    <p>AI-generated output is not treated as evidence, and unsupported claims should not be added simply because an automated system produced them.</p>
    <p>For sensitive categories such as healthcare, additional verification is expected.</p>

    <h2>Ranking Limitations</h2>
    <p>No ranking system can perfectly determine which business or professional is best for every individual.</p>
    <p>Public information can be incomplete, outdated, or unevenly available.</p>
    <p>Wikibulz does not independently test every service, treatment, or customer experience unless explicitly stated.</p>
    <p>Our rankings should therefore be used as a research and comparison tool, not as an absolute guarantee of quality or suitability.</p>
    <p>Readers should verify important details directly before making significant decisions.</p>

    <h2>Updates</h2>
    <p>Rankings may change as new information becomes available.</p>
    <p>We may update a ranking when:</p>
    <BulletList items={updateReasons} />
    <p>An older ranking position is not guaranteed permanently.</p>

    <h2>Corrections and Challenges</h2>
    <p>Businesses, professionals, and readers may contact Wikibulz if they believe factual information is inaccurate or outdated.</p>
    <p>Useful submissions should include:</p>
    <BulletList items={correctionDetails} />
    <p>We review credible evidence fairly.</p>
    <p>Submitting a correction does not guarantee a higher ranking.</p>
    <p>Likewise, disagreeing with an editorial position does not automatically mean the ranking is factually incorrect.</p>

    <h2>Our Commitment</h2>
    <p>Wikibulz rankings are built to make comparison easier, not to manufacture certainty.</p>
    <p>We aim to prioritize relevance over popularity, evidence over hype, transparency over hidden influence, and reader usefulness over pay-to-win rankings.</p>
    <p>As Wikibulz grows, we will continue refining our methodology while keeping one principle unchanged: the ranking should serve the reader first.</p>
  </main><Footer /></>;
}
