import { seoConfig } from "@/config/seo";
import { absoluteUrl, resolvePostCanonical } from "@/lib/seo/url";
import type { Author, Post } from "@/types/content";

function compact<T extends Record<string, unknown>>(value: T) { return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null && entry !== "")) as T; }
const organizationId = () => seoConfig.siteUrl + "#organization";
const websiteId = () => seoConfig.siteUrl + "#website";
function credentialEntities(author: Author) {
  const credentials = [...author.credentials, ...(author.education ?? [])].map((name) => compact({ "@type": "EducationalOccupationalCredential", name }));
  return credentials.length ? credentials : undefined;
}
function personEntity(author: Author) {
  const authorUrl = absoluteUrl("/author/" + author.slug);
  return compact({
    "@type": "Person",
    "@id": authorUrl + "#person",
    name: author.name,
    url: authorUrl,
    image: author.avatar ? absoluteUrl(author.avatar.url) : undefined,
    description: author.bio,
    jobTitle: author.jobTitle,
    worksFor: author.organization ? { "@type": "Organization", name: author.organization } : undefined,
    affiliation: author.organization ? { "@type": "Organization", name: author.organization } : { "@id": organizationId() },
    homeLocation: author.location ? { "@type": "Place", name: author.location } : undefined,
    knowsAbout: author.expertise.length ? author.expertise : undefined,
    hasCredential: credentialEntities(author),
    award: author.awards?.length ? author.awards : undefined,
    sameAs: author.socialLinks.length ? author.socialLinks : undefined,
    mainEntityOfPage: { "@type": "ProfilePage", "@id": authorUrl },
  });
}
export function organizationSchema() { return compact({ "@context": "https://schema.org", "@type": "Organization", "@id": organizationId(), name: seoConfig.organization.name, url: seoConfig.siteUrl, logo: absoluteUrl(seoConfig.organization.logo), sameAs: seoConfig.organization.sameAs }); }
export function websiteSchema() { return { "@context": "https://schema.org", "@type": "WebSite", "@id": websiteId(), name: seoConfig.siteName, url: seoConfig.siteUrl, publisher: { "@id": organizationId() }, potentialAction: { "@type": "SearchAction", target: seoConfig.siteUrl + "/search?q={search_term_string}", "query-input": "required name=search_term_string" } }; }
function topicEntity(name: string, url?: string, type: "Thing" | "Place" = "Thing") { return compact({ "@type": type, name, url: url ? absoluteUrl(url) : undefined }); }
function articleTopics(post: Post) {
  return [
    topicEntity(post.category.name, "/category/" + (post.category.categoryPath?.join("/") ?? post.category.slug)),
    post.country ? topicEntity(post.country.name, "/" + post.country.slug, "Place") : undefined,
    post.state ? topicEntity(post.state.name, "/" + post.state.slug, "Place") : undefined,
    post.city ? topicEntity(post.city.name, "/" + post.city.slug, "Place") : undefined,
    ...post.tags.map((tag) => topicEntity(tag.name, "/tags/" + tag.slug)),
    ...[post.focusKeyword, ...post.secondaryKeywords].filter(Boolean).map((keyword) => topicEntity(String(keyword))),
  ].filter(Boolean);
}
function articleLocation(post: Post) {
  const location = post.city ?? post.state ?? post.country;
  return location ? topicEntity(location.name, "/" + location.slug, "Place") : undefined;
}
export function articleSchema(post: Post) {
  const canonical = resolvePostCanonical(post);
  const reviewers = [
    post.reviewer ? personEntity(post.reviewer) : post.reviewedBy ? { "@type": "Person", name: post.reviewedBy } : undefined,
    post.factCheckedBy ? personEntity(post.factCheckedBy) : undefined,
  ].filter(Boolean);
  const reviewer = reviewers.length === 1 ? reviewers[0] : reviewers.length ? reviewers : undefined;
  const topics = articleTopics(post);
  return compact({
    "@context": "https://schema.org",
    "@type": post.schemaType,
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(post.featuredImage.url),
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    dateReviewed: post.lastReviewedAt,
    author: personEntity(post.author),
    editor: reviewer,
    reviewedBy: reviewer,
    citation: [...post.sources, ...post.references].map((source) => compact({ "@type": "CreativeWork", name: source.title, url: source.url, publisher: source.publisher, dateModified: source.dateAccessed })),
    publisher: organizationSchema(),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    url: canonical,
    keywords: [post.focusKeyword, ...post.secondaryKeywords].filter(Boolean).join(", "),
    articleSection: post.category.name,
    about: topics,
    mentions: topics,
    spatialCoverage: articleLocation(post),
    contentLocation: articleLocation(post),
    wordCount: post.wordCount,
    timeRequired: `PT${post.readingTime}M`,
  });
}
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) { return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.url) })) }; }
export function itemListSchema(items: Array<{ name: string; url: string }>, name: string) { return { "@context": "https://schema.org", "@type": "ItemList", name, itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: absoluteUrl(item.url) })) }; }
export function faqSchema(post: Post) { return post.faqs.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: post.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) } : null; }
export function personSchema(author: Author) { return compact({ "@context": "https://schema.org", ...personEntity(author) }); }
