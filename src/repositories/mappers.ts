import type { Author, Category, MediaAsset, Post, RedirectRecord, StaticPage, Tag } from "@/types/content";

type PlainRecord = Record<string, unknown>;

const asRecord = (value: unknown): PlainRecord => (value && typeof value === "object" ? (value as PlainRecord) : {});
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const asBoolean = (value: unknown, fallback = false) => (typeof value === "boolean" ? value : fallback);
const asNumber = (value: unknown, fallback = 0) => (typeof value === "number" ? value : fallback);
const asIsoDate = (value: unknown) => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
};

const idOf = (record: PlainRecord) => asString(record.id) || asString(record._id);
const categoryPathOf = (value: unknown) => {
  const path: string[] = [];
  const seen = new Set<string>();
  let current: unknown = value;
  while (current && typeof current === "object") {
    const record = asRecord(current);
    const slug = asString(record.slug);
    if (!slug || seen.has(slug)) break;
    seen.add(slug);
    path.unshift(slug);
    current = record.parentCategory;
  }
  return path;
};

export function mapMedia(value: unknown): MediaAsset {
  const record = asRecord(value);
  return {
    url: asString(record.url, "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80"),
    alt: asString(record.alt, "Editorial image"),
    width: asNumber(record.width, 1600),
    height: asNumber(record.height, 900),
    caption: asString(record.caption) || undefined,
    credit: asString(record.credit) || undefined,
  };
}

export function mapAuthor(value: unknown): Author {
  const record = asRecord(value);
  return {
    id: idOf(record),
    name: asString(record.name, "Editorial Team"),
    slug: asString(record.slug, "editorial-team"),
    email: asString(record.email, "editorial@wikibulz.com"),
    bio: asString(record.bio, "Editorial profile."),
    avatar: record.avatar ? mapMedia(record.avatar) : undefined,
    jobTitle: asString(record.jobTitle) || undefined,
    expertise: asArray(record.expertise).map((item) => asString(item)).filter(Boolean),
    credentials: asArray(record.credentials).map((item) => asString(item)).filter(Boolean),
    socialLinks: asArray(record.socialLinks).map((item) => asString(item)).filter(Boolean),
    website: asString(record.website) || undefined,
    status: asString(record.status) === "inactive" ? "inactive" : "active",
    createdAt: asIsoDate(record.createdAt),
    updatedAt: asIsoDate(record.updatedAt),
  };
}

export function mapCategory(value: unknown): Category {
  const record = asRecord(value);
  const parent = asRecord(record.parentCategory);
  const categoryPath = categoryPathOf(record);
  return {
    id: idOf(record),
    name: asString(record.name, "Uncategorized"),
    slug: asString(record.slug, "uncategorized"),
    description: asString(record.description, "Editorial category."),
    seoTitle: asString(record.seoTitle) || undefined,
    metaDescription: asString(record.metaDescription) || undefined,
    canonicalUrl: asString(record.canonicalUrl) || undefined,
    indexStatus: asString(record.indexStatus) === "noindex" ? "noindex" : "index",
    parentCategory: asString(record.parentCategory) || asString(parent._id) || undefined,
    categoryPath: categoryPath.length ? categoryPath : undefined,
    featuredImage: record.featuredImage ? mapMedia(record.featuredImage) : undefined,
  };
}

export function mapTag(value: unknown): Tag {
  const record = asRecord(value);
  return {
    id: idOf(record),
    name: asString(record.name),
    slug: asString(record.slug),
    description: asString(record.description) || undefined,
    indexStatus: asString(record.indexStatus) === "index" ? "index" : "noindex",
  };
}

export function mapPost(value: unknown): Post {
  const record = asRecord(value);
  return {
    id: idOf(record),
    title: asString(record.title),
    slug: asString(record.slug),
    publicId: asString(record.publicId) || undefined,
    excerpt: asString(record.excerpt),
    content: asString(record.content),
    featuredImage: mapMedia(record.featuredImage),
    author: mapAuthor(record.author),
    reviewer: record.reviewer ? mapAuthor(record.reviewer) : undefined,
    factCheckedBy: record.factCheckedBy ? mapAuthor(record.factCheckedBy) : undefined,
    category: mapCategory(record.category),
    tags: asArray(record.tags).map(mapTag),
    status: ["draft", "review", "scheduled", "published", "archived", "trash"].includes(asString(record.status))
      ? (asString(record.status) as Post["status"])
      : "draft",
    publishedAt: record.publishedAt ? asIsoDate(record.publishedAt) : undefined,
    updatedAt: asIsoDate(record.updatedAt),
    scheduledAt: record.scheduledAt ? asIsoDate(record.scheduledAt) : undefined,
    seoTitle: asString(record.seoTitle) || undefined,
    metaDescription: asString(record.metaDescription) || undefined,
    canonicalUrl: asString(record.canonicalUrl) || undefined,
    robotsIndex: asBoolean(record.robotsIndex, true),
    robotsFollow: asBoolean(record.robotsFollow, true),
    focusKeyword: asString(record.focusKeyword) || undefined,
    secondaryKeywords: asArray(record.secondaryKeywords).map((item) => asString(item)).filter(Boolean),
    ogTitle: asString(record.ogTitle) || undefined,
    ogDescription: asString(record.ogDescription) || undefined,
    ogImage: record.ogImage ? mapMedia(record.ogImage) : undefined,
    twitterTitle: asString(record.twitterTitle) || undefined,
    twitterDescription: asString(record.twitterDescription) || undefined,
    twitterImage: record.twitterImage ? mapMedia(record.twitterImage) : undefined,
    schemaType: ["Article", "BlogPosting", "NewsArticle"].includes(asString(record.schemaType))
      ? (asString(record.schemaType) as Post["schemaType"])
      : "BlogPosting",
    featured: asBoolean(record.featured),
    editorPick: asBoolean(record.editorPick),
    readingTime: asNumber(record.readingTime),
    wordCount: asNumber(record.wordCount),
    views: asNumber(record.views),
    shares: asNumber(record.shares),
    tableOfContents: asArray(record.tableOfContents).map((item) => {
      const toc = asRecord(item);
      return { id: asString(toc.id), text: asString(toc.text), level: asNumber(toc.level, 2) === 3 ? 3 : 2 };
    }),
    relatedPosts: asArray(record.relatedPosts).map((item) => asString(item)).filter(Boolean),
    manualInternalLinks: asArray(record.manualInternalLinks).map((item) => asString(item)).filter(Boolean),
    sources: asArray(record.sources).map((item) => {
      const source = asRecord(item);
      return {
        title: asString(source.title),
        url: asString(source.url),
        publisher: asString(source.publisher) || undefined,
        dateAccessed: asString(source.dateAccessed) || undefined,
      };
    }),
    references: asArray(record.references).map((item) => {
      const source = asRecord(item);
      return {
        title: asString(source.title),
        url: asString(source.url),
        publisher: asString(source.publisher) || undefined,
        dateAccessed: asString(source.dateAccessed) || undefined,
      };
    }),
    faqs: asArray(record.faqs).map((item) => {
      const faq = asRecord(item);
      return { question: asString(faq.question), answer: asString(faq.answer) };
    }),
    reviewedBy: asString(record.reviewedBy) || undefined,
    lastReviewedAt: record.lastReviewedAt ? asIsoDate(record.lastReviewedAt) : undefined,
    redirectHistory: asArray(record.redirectHistory).map((item) => asString(item)).filter(Boolean),
    createdAt: asIsoDate(record.createdAt),
  };
}

export function mapStaticPage(value: unknown): StaticPage {
  const record = asRecord(value);
  return {
    id: idOf(record),
    title: asString(record.title),
    slug: asString(record.slug),
    excerpt: asString(record.excerpt),
    content: asString(record.content),
    seoTitle: asString(record.seoTitle) || undefined,
    metaDescription: asString(record.metaDescription) || undefined,
    canonicalUrl: asString(record.canonicalUrl) || undefined,
    robotsIndex: asBoolean(record.robotsIndex, true),
    robotsFollow: asBoolean(record.robotsFollow, true),
    updatedAt: asIsoDate(record.updatedAt),
  };
}

export function mapRedirect(value: unknown): RedirectRecord {
  const record = asRecord(value);
  const code = asNumber(record.statusCode, 301);
  return {
    id: idOf(record),
    sourcePath: asString(record.sourcePath),
    destinationPath: asString(record.destinationPath),
    statusCode: code === 302 || code === 307 || code === 308 ? code : 301,
    active: asBoolean(record.active, true),
    createdAt: asIsoDate(record.createdAt),
  };
}
