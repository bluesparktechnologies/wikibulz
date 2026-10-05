import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { generateStaticMetadata } from "@/lib/seo/metadata";
import type { ReactNode } from "react";

export const metadata = generateStaticMetadata({
  title: "About Wikibulz",
  description: "Learn about Wikibulz, a local discovery and comparison platform built around transparent rankings, editorial research, and practical city guides.",
  path: "/about",
  index: true,
});

const decisionHelp = [
  "Which options are worth comparing",
  "What factors actually matter",
  "Where important differences exist",
  "Which details deserve a final check before you choose a provider",
];

const healthcareCoverage = [
  "Dentists and dental clinics",
  "Doctors and specialists",
  "Hospitals",
  "Diagnostic centres",
  "Physiotherapists",
  "Other healthcare services",
];

const educationCoverage = [
  "Coaching institutes",
  "IAS and competitive exam coaching",
  "Schools",
  "Preschools",
  "Educational institutes",
  "Skill and professional training providers",
];

const professionalCoverage = [
  "SEO companies",
  "Digital marketing agencies",
  "Web development companies",
  "Accountants and CA firms",
  "Legal services",
  "Consultants",
  "Other professional service providers",
];

const lifestyleCoverage = [
  "Restaurants and cafes",
  "Salons and beauty services",
  "Interior designers",
  "Architects",
  "Real estate services",
  "Home services",
  "Travel services",
  "Event professionals",
  "Other useful local categories",
];

const usefulGuideSignals = [
  "Why an option was included",
  "What its strongest signals are",
  "Who it may be suitable for",
  "What limitations exist in the available information",
  "What questions readers should ask before choosing",
];

const researchSources = [
  "Official business websites",
  "Professional profiles",
  "Government or regulatory information",
  "Recognized industry platforms",
  "Public business listings",
  "Public review patterns",
  "Documented qualifications",
  "Experience and specialization",
  "Service information",
  "Location and accessibility",
  "Pricing transparency where available",
  "Other category-specific trust signals",
];

const commercialFormats = [
  "Sponsored placements",
  "Featured listings",
  "Advertisements",
  "Paid partnerships",
];

const changingDetails = [
  "Move",
  "Change phone numbers",
  "Update services",
  "Change staff",
  "Change opening hours",
  "Gain new qualifications",
  "Close or reopen",
];

const healthcareSignals = [
  "General qualifications",
  "Specialist qualifications",
  "Publicly documented professional experience",
  "Patient-feedback signals",
  "Claims published by the provider itself",
];

const authorSignals = [
  "Name",
  "Editorial role",
  "Area of coverage",
  "Relevant experience",
  "Published work",
];

const correctionIssues = [
  "Incorrect information",
  "An outdated address",
  "Incorrect qualifications",
  "Changed services",
  "A closed business",
  "Another factual issue",
];

const rankingChangeReasons = [
  "New evidence becomes available",
  "Businesses or professionals change",
  "Stronger options emerge",
  "Public information changes",
  "Our research improves",
  "Our ranking methodology evolves",
];

const limits = [
  "Medical outcomes",
  "Service quality in every individual case",
  "Professional results",
  "Current availability",
  "Exact pricing",
  "That the number one ranked option will be right for everyone",
];

function BulletList({ items }: { items: string[] }) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function CoverageBlock({ title, children }: { title: string; children: ReactNode }) {
  return <section>
    <h3>{title}</h3>
    {children}
  </section>;
}

export default function AboutPage() {
  return <><SiteHeader /><main>
    <section className="border-b border-[var(--line)] bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">About Wikibulz</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.04] md:text-7xl">Local discovery should be easier to understand.</h1>
        <p className="mt-7 max-w-2xl text-xl leading-9 text-[var(--muted)]">Wikibulz is a local discovery and comparison platform built to help people make better-informed choices.</p>
      </div>
    </section>

    <article className="prose-content mx-auto max-w-3xl px-5 py-10">
      <p>We research local businesses, professionals, services, and places, then organize that information into practical city guides, rankings, and comparison pages.</p>
      <p>Our goal is not to tell every reader that there is one universal best option.</p>
      <p>Instead, we help you understand:</p>
      <BulletList items={decisionHelp} />
      <p>Whether you are looking for a dentist, coaching institute, digital marketing agency, restaurant, school, or another local service, Wikibulz aims to make the research process clearer and more useful.</p>

      <h2>What Wikibulz Covers</h2>
      <p>Wikibulz is being built city by city, category by category.</p>
      <p>Rather than creating thousands of empty or repetitive pages, we focus on developing useful local guides around the services people genuinely compare.</p>

      <CoverageBlock title="Healthcare">
        <p>Our healthcare coverage may include:</p>
        <BulletList items={healthcareCoverage} />
        <p>For healthcare topics, professional qualifications, relevant specialization, transparency, and reliable public information may carry greater importance than popularity alone.</p>
      </CoverageBlock>

      <CoverageBlock title="Education">
        <p>We research and compare options such as:</p>
        <BulletList items={educationCoverage} />
        <p>Relevant factors may include faculty information, course coverage, student support, reputation, and transparency.</p>
      </CoverageBlock>

      <CoverageBlock title="Business and Professional Services">
        <p>Wikibulz may cover:</p>
        <BulletList items={professionalCoverage} />
        <p>We look beyond promotional claims and consider factors such as specialization, experience, service depth, portfolio evidence, reputation, and transparency where available.</p>
      </CoverageBlock>

      <CoverageBlock title="Food, Home, Lifestyle, Travel, and More">
        <p>As Wikibulz expands, our local discovery guides may also cover:</p>
        <BulletList items={lifestyleCoverage} />
        <p>The factors we evaluate change depending on the category because choosing a restaurant is very different from choosing a doctor or professional service provider.</p>
      </CoverageBlock>

      <h2>What Makes Wikibulz Different</h2>
      <p>The internet already contains plenty of lists.</p>
      <p>We want Wikibulz to provide something more useful than another generic Top 10 page.</p>
      <p>Our guides aim to explain:</p>
      <BulletList items={usefulGuideSignals} />
      <p>A ranking should help you make a better decision, not simply give you a number.</p>

      <h2>How We Research Rankings</h2>
      <p>Wikibulz uses publicly available information and editorial research to evaluate local options.</p>
      <p>Our research process can draw on a range of sources and evidence, including:</p>
      <BulletList items={researchSources} />
      <p>We prefer reliable and direct sources whenever they are available.</p>
      <p>Information provided by a business about itself can be useful, but we distinguish first-party claims from independent evidence.</p>
      <p>For a fuller look at the criteria behind our rankings, see our <Link href="/how-we-rank">How We Rank methodology</Link>.</p>

      <h2>Why Ratings Alone Do Not Decide Our Rankings</h2>
      <p>Public ratings can be helpful, but they do not tell the whole story.</p>
      <p>For example, a business with a perfect rating from a very small number of reviews is not automatically stronger than an established business with hundreds of consistently positive reviews.</p>
      <p>And in categories such as healthcare, relevant professional expertise may matter considerably more than a small difference in star rating.</p>
      <p>That is why Wikibulz considers multiple signals together.</p>

      <h2>Editorial Independence</h2>
      <p>Trust depends on readers knowing the difference between editorial judgment and advertising.</p>
      <p>Commercial relationships do not automatically secure a business the top spot in an independent Wikibulz ranking.</p>
      <p>If Wikibulz publishes any of the following, they should be clearly identified where appropriate:</p>
      <BulletList items={commercialFormats} />
      <p>Commercial relationships should not be hidden inside editorial rankings.</p>

      <h2>Our Approach to AI</h2>
      <p>Wikibulz may use AI-assisted tools and automation to support parts of the editorial process, including research organization, data processing, content structuring, and editing.</p>
      <p>But AI does not independently decide which business deserves to rank first.</p>
      <p>Information produced by automated tools is not accepted as evidence on its own.</p>
      <p>Editorial decisions should be based on relevant information, reliable sources, and human judgment.</p>
      <p>For sensitive topics such as healthcare, we apply additional caution to factual and professional claims.</p>

      <h2>Accuracy Matters</h2>
      <p>Local information changes frequently. Businesses can:</p>
      <BulletList items={changingDetails} />
      <p>Public review profiles also keep evolving as new feedback is added over time.</p>
      <p>We aim to keep our guides accurate, but readers should confirm important or time-sensitive information directly with the relevant business or professional before making a major decision.</p>

      <h2>Healthcare and High-Impact Decisions</h2>
      <p>Some decisions carry greater consequences than others.</p>
      <p>Healthcare, financial, and legal topics deserve additional care.</p>
      <p>Wikibulz healthcare guides are intended to help readers research and compare available options.</p>
      <p>They are not medical advice, and a Wikibulz ranking does not replace diagnosis or treatment from an appropriately qualified professional.</p>
      <p>Where relevant, we try to distinguish:</p>
      <BulletList items={healthcareSignals} />
      <p>For urgent health concerns, readers should seek appropriate professional or emergency assistance rather than relying on an online ranking.</p>

      <h2>Our Authors and Editorial Team</h2>
      <p>Where practical, Wikibulz identifies the author or editorial team responsible for an article.</p>
      <p>Author information may include:</p>
      <BulletList items={authorSignals} />
      <p>When an article has genuinely been reviewed or fact-checked by another person, that contribution may also be disclosed.</p>
      <p>We do not invent author identities, reviewers, professional experience, or credentials to make an article appear more authoritative.</p>

      <h2>Corrections and Updates</h2>
      <p>We want readers, businesses, and professionals to tell us when something is wrong.</p>
      <p>If you find:</p>
      <BulletList items={correctionIssues} />
      <p>You can contact the Wikibulz editorial team.</p>
      <p>Useful correction requests should include the article URL, the information in question, and supporting evidence where possible.</p>
      <p>Corrections do not automatically change ranking positions, but credible new evidence may influence future editorial reviews.</p>

      <h2>Rankings Can Change</h2>
      <p>Wikibulz rankings are not permanent.</p>
      <p>Positions may change when:</p>
      <BulletList items={rankingChangeReasons} />
      <p>We believe a ranking should reflect the strongest information currently available rather than preserve an old position indefinitely.</p>

      <h2>What Wikibulz Does Not Promise</h2>
      <p>No ranking platform can guarantee that one business will be the perfect choice for every reader.</p>
      <p>Wikibulz does not guarantee:</p>
      <BulletList items={limits} />
      <p>Our job is to make your research better informed, faster, and more transparent.</p>
      <p>The final decision is yours.</p>

      <h2>Our Mission</h2>
      <p>Wikibulz is being built around a simple idea: local recommendations should be easier to research and easier to trust.</p>
      <p>We want readers to move through three simple steps:</p>
      <p><strong>Compare, Shortlist, Decide.</strong></p>
      <p><Link href="/contact" className="inline-flex items-center gap-2 font-black">Contact Wikibulz <ArrowUpRight size={16} /></Link></p>
    </article>
  </main><Footer /></>;
}
