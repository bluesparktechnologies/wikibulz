import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { generateAuthorMetadata } from "@/lib/seo/metadata";
import { personSchema } from "@/lib/seo/schema";
import { getAuthorBySlug, getPostsByAuthor } from "@/repositories/content.repository";
import type { Author } from "@/types/content";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

const editorialTeamSlugs = new Set(["wikibulz-research-team", "wikibulz-editorial-research-team"]);
const editorialTeamName = "Wikibulz Editorial Research Team";
const editorialTeamTitle = "Local Business Research & Comparison Team";
const editorialTeamBio = "The Wikibulz Editorial Research Team researches local businesses, professionals, and services to help readers compare options with greater clarity and confidence.";

function authorDisplayProfile(author: Author): Author {
  if (!editorialTeamSlugs.has(author.slug)) return author;
  return { ...author, name: editorialTeamName, jobTitle: editorialTeamTitle, bio: editorialTeamBio };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await getAuthorBySlug((await params).slug);
  if (!author) return {};
  const posts = await getPostsByAuthor(author.slug);
  return { ...generateAuthorMetadata(authorDisplayProfile(author)), robots: { index: author.status === "active" && posts.length > 0, follow: true } };
}

function DetailList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return <div>
    <h2 className="text-sm font-black uppercase tracking-[0.08em] text-[#60736b]">{title}</h2>
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => <span key={item} className="rounded-full border border-[#d3e2da] bg-white px-3 py-1 text-sm font-semibold">{item}</span>)}
    </div>
  </div>;
}

const teamActivities = [
  "Local business rankings",
  "City-based comparison guides",
  "Professional service shortlists",
  "Category discovery pages",
  "Practical decision guides",
  "Research-backed local recommendations",
];

const researchSources = [
  "Official business and professional websites",
  "Government or regulatory sources",
  "Professional profiles and credentials",
  "Recognized industry platforms",
  "Public business listings",
  "Documented experience and specialization",
  "Customer feedback patterns",
  "Location and accessibility",
  "Pricing transparency where available",
  "Other category-specific trust signals",
];

const evaluationSignals = [
  "Relevance: Does the business actually match the service being researched?",
  "Expertise and specialization: Qualifications, specialist training, and category-specific competence",
  "Reputation: Review volume, consistency, recency, and recurring themes across platforms",
  "Experience: Documented experience where it is relevant, not treated as an automatic advantage",
  "Transparency: How clearly readers can verify identity, services, credentials, location, and policies",
  "Local presence: Genuine relevance to the city or locality",
  "Evidence quality: Strength and reliability of the available information",
];

const rankingNonGuarantees = [
  "Highest Google rating",
  "Most reviews",
  "Strongest website",
  "Largest social following",
  "Biggest brand",
  "Lowest or highest price",
];

const healthcareStandards = [
  "Qualifications",
  "Specialist training",
  "Professional registration where available",
  "Relevant experience",
  "Treatment fit",
  "Transparency",
];

const educationStandards = [
  "Faculty information",
  "Course coverage",
  "Teaching model",
  "Student support",
  "Track record",
  "Reputation",
  "Local accessibility",
];

const professionalServiceStandards = [
  "Specialization",
  "Experience",
  "Service depth",
  "Portfolio or case evidence",
  "Reputation",
  "Transparency",
];

const lifestyleStandards = [
  "Customer experience",
  "Consistency",
  "Accessibility",
  "Service variety",
  "Convenience",
  "Value",
  "Local reputation",
];

const trustProtections = [
  "Invent qualifications or credentials",
  "Create fake authors, reviewers, or experts",
  "Fabricate ratings or testimonials",
  "Manufacture first-hand experience",
  "Present paid placement as independent judgment",
  "Hide commercial influence inside rankings",
  "Update dates only to appear fresh",
  "Claim certainty when the evidence does not support it",
];

const editorialQuestions = [
  "Why was this option included?",
  "What evidence supports its inclusion?",
  "What should the reader verify before deciding?",
];

function BulletList({ items }: { items: string[] }) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return <section>
    <h2>{title}</h2>
    {children}
  </section>;
}

function CategoryStandard({ title, children }: { title: string; children: ReactNode }) {
  return <section>
    <h3>{title}</h3>
    {children}
  </section>;
}

function EditorialResearchTeamProfile() {
  return <section className="prose-content mt-12 max-w-3xl">
    <p>The Wikibulz Editorial Research Team researches local businesses, professionals, and services to help readers compare options with greater clarity and confidence.</p>
    <p>We cover healthcare, education, professional services, home services, food, lifestyle, travel, and other city-based categories.</p>
    <p>Our core principle is simple: a strong ranking should make the differences between options clearer, rather than simply naming a winner.</p>
    <p>We evaluate the evidence that actually matters for the decision, explain meaningful differences, and clearly state limitations when information is incomplete.</p>

    <ProfileSection title="What We Do">
      <p>We create:</p>
      <BulletList items={teamActivities} />
      <p>Our goal is to make local research faster, clearer, and more useful.</p>
    </ProfileSection>

    <ProfileSection title="Our Research Approach">
      <p>Every category requires a different evaluation framework. The factors that matter when comparing a dentist are different from those that matter for a coaching institute, restaurant, or digital marketing agency.</p>
      <p>That is why we do not use one fixed formula for every ranking.</p>
      <p>Depending on the topic, our research may include:</p>
      <BulletList items={researchSources} />
      <p>We prioritize direct and authoritative sources. When a claim comes only from a business&apos;s own website, we treat it as self-reported unless independently supported.</p>
    </ProfileSection>

    <ProfileSection title="How We Evaluate Options">
      <p>We start with one question: what would genuinely help a reader make a better choice in this category?</p>
      <p>From there, we assess:</p>
      <BulletList items={evaluationSignals} />
    </ProfileSection>

    <ProfileSection title="Rankings Are More Than Numbers">
      <p>We do not automatically rank businesses by:</p>
      <BulletList items={rankingNonGuarantees} />
      <p>Context always matters. A 5.0 rating from a small number of reviews is not automatically stronger than a 4.8 rating backed by a much deeper feedback history.</p>
      <p>In professional categories, relevant specialization often matters more than popularity.</p>
    </ProfileSection>

    <ProfileSection title="Category-Specific Standards">
      <CategoryStandard title="Healthcare">
        <p>We give additional weight to:</p>
        <BulletList items={healthcareStandards} />
        <p>Wikibulz healthcare content is for research and comparison only. It should not be used in place of care or guidance from an appropriately qualified health professional.</p>
      </CategoryStandard>
      <CategoryStandard title="Education">
        <p>We consider:</p>
        <BulletList items={educationStandards} />
      </CategoryStandard>
      <CategoryStandard title="Professional Services">
        <p>We evaluate:</p>
        <BulletList items={professionalServiceStandards} />
      </CategoryStandard>
      <CategoryStandard title="Food, Lifestyle, Home Services, and Other Categories">
        <p>More weight is given to:</p>
        <BulletList items={lifestyleStandards} />
      </CategoryStandard>
    </ProfileSection>

    <ProfileSection title="Editorial Independence">
      <p>Editorial rankings remain separate from commercial relationships.</p>
      <p>A business does not receive a higher independent ranking because it advertises with us, purchases a featured profile, or enters a partnership.</p>
      <p>Sponsored or promoted placements are clearly distinguished from independent editorial rankings.</p>
    </ProfileSection>

    <ProfileSection title="Our Approach to AI">
      <p>We may use AI-assisted tools to support research organization, structuring, drafting, editing, and data processing.</p>
      <p>AI does not decide rankings.</p>
      <p>Automated output is never accepted as sufficient evidence on its own.</p>
      <p>Important factual claims, especially in sensitive categories, are supported by reliable sources and remain under human editorial responsibility.</p>
    </ProfileSection>

    <ProfileSection title="Accuracy and Verification">
      <p>Local information changes quickly. Businesses update locations, staff, services, timings, pricing, and status. Ratings also change.</p>
      <p>We use the strongest information reasonably available at the time of research or update.</p>
      <p>Readers should still confirm important details directly with the provider before making a significant decision.</p>
    </ProfileSection>

    <ProfileSection title="What We Do Not Do">
      <p>To protect reader trust, we do not:</p>
      <BulletList items={trustProtections} />
      <p>When information is limited, we say so clearly.</p>
    </ProfileSection>

    <ProfileSection title="Authors, Reviewers, and Accountability">
      <p>Content published under the Wikibulz Editorial Research Team follows our research framework.</p>
      <p>A reviewer or professional is listed only when they genuinely reviewed the content and their credentials are real and relevant.</p>
      <p>We never imply expert review when it did not occur.</p>
    </ProfileSection>

    <ProfileSection title="Corrections">
      <p>If incorrect or outdated information is identified, we review the evidence and update the page where appropriate.</p>
      <p>A useful correction request includes the page URL, the incorrect information, the corrected information, and supporting evidence.</p>
      <p>A factual correction does not automatically result in a higher ranking.</p>
    </ProfileSection>

    <ProfileSection title="Our Editorial Standard">
      <p>Every strong Wikibulz ranking should clearly answer three questions:</p>
      <BulletList items={editorialQuestions} />
      <p>If a ranking cannot answer these questions meaningfully, it does not meet our standard.</p>
    </ProfileSection>

    <ProfileSection title="Our Mission">
      <p>Local decisions should be easier to research and easier to trust.</p>
      <p>We want readers to move through a clear process:</p>
      <p><strong>Discover, Compare, Shortlist, Decide.</strong></p>
    </ProfileSection>
  </section>;
}

export default async function AuthorPage({ params }: Props) {
  const author = await getAuthorBySlug((await params).slug);
  if (!author) notFound();
  const posts = await getPostsByAuthor(author.slug);
  const displayAuthor = authorDisplayProfile(author);
  const publicLinks = [author.website, ...author.socialLinks].filter((url): url is string => Boolean(url));
  const isEditorialTeam = editorialTeamSlugs.has(author.slug);

  return <>
    <SiteHeader />
    <JsonLd data={personSchema(displayAuthor)} />
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="grid gap-8 rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm md:grid-cols-[180px_1fr]">
        {author.avatar ? <Image src={author.avatar.url} alt={author.avatar.alt} width={author.avatar.width} height={author.avatar.height} className="size-44 rounded-lg object-cover" priority /> : <div className="grid size-44 place-items-center rounded-lg bg-[#e7f1ec] text-6xl font-black text-[var(--brand)]">{author.name.slice(0, 1)}</div>}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--accent)]">Author</p>
          <h1 className="mt-2 text-4xl font-black md:text-5xl">{displayAuthor.name}</h1>
          <p className="mt-2 text-lg font-semibold text-[var(--brand)]">{[displayAuthor.jobTitle, displayAuthor.organization].filter(Boolean).join(" · ")}</p>
          {author.location ? <p className="mt-1 text-sm text-[var(--muted)]">{author.location}</p> : null}
          <p className="mt-5 max-w-3xl leading-7 text-[var(--muted)]">{displayAuthor.bio}</p>
          {publicLinks.length ? <div className="mt-5 flex flex-wrap gap-3">
            {publicLinks.map((url) => <Link key={url} href={url} rel="nofollow noopener noreferrer" target="_blank" className="rounded-full border border-[#cfe0d8] px-4 py-2 text-sm font-bold text-[var(--brand)]">Profile link</Link>)}
          </div> : null}
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <DetailList title="Expertise" items={author.expertise} />
        <DetailList title="Credentials" items={author.credentials} />
        <DetailList title="Education" items={author.education} />
        <DetailList title="Recognition" items={author.awards} />
      </section>

      {isEditorialTeam ? <EditorialResearchTeamProfile /> : null}

      <h2 className="mt-12 text-3xl font-black">Articles by {displayAuthor.name}</h2>
      <div className="mt-6 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCard key={post.id} post={post}/>)}</div>
      {posts.length === 0 ? <p className="mt-6 rounded-lg border border-[var(--line)] bg-white p-5 text-[var(--muted)]">No published articles yet.</p> : null}
    </main>
    <Footer />
  </>;
}
