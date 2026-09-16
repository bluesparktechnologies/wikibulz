import { z } from "zod";
import { seoConfig } from "@/config/seo";
import { calculateReadingMinutes, calculateWordCount, ensureHeadingIds, generateTableOfContents } from "@/lib/content/processing";
import { connectMongo } from "@/lib/db/mongoose";
import { sanitizeArticleHtml } from "@/lib/seo/analysis";
import { compactPostSlug, normalizeSlug } from "@/lib/seo/url";
import { runPromptStructuredTask } from "@/modules/autoblog/ai/gemini-text.service";
import type { EditorialProfile, SiteNicheProfile } from "@/modules/autoblog/types/automation";
import type { NewsTopic, SerpSnapshot } from "@/modules/autoblog/types/providers";
import { AuthorModel, CategoryModel, MediaAssetModel, PostModel, TagModel } from "@/models/schemas";

const fallbackImage = {
  url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
  alt: "Technology workspace with code and digital product planning",
  width: 1600,
  height: 900,
  caption: undefined as string | undefined,
};

function boundedString(min: number, max: number) {
  return z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length <= max) return normalized;
    const clipped = normalized.slice(0, max);
    const lastSpace = clipped.lastIndexOf(" ");
    return `${clipped.slice(0, lastSpace > min ? lastSpace : max - 1).trimEnd()}.`;
  }, z.string().min(min).max(max));
}

export const articleDraftSchema = z.object({
  title: boundedString(20, 120),
  slug: boundedString(5, 120),
  excerpt: boundedString(80, 220),
  seoTitle: boundedString(20, 70),
  metaDescription: boundedString(70, 160),
  category: z.string().min(2).max(60),
  tags: z.array(z.string().min(2).max(40)).min(2).max(8),
  focusKeyword: z.string().min(2).max(120),
  secondaryKeywords: z.array(z.string().min(2).max(120)).min(2).max(10),
  contentHtml: z.string().min(800),
  faqs: z.array(z.object({ question: z.string().min(8), answer: z.string().min(20) })).max(4),
  imageBrief: z.string().min(40).max(700),
  imageAlt: z.string().min(20).max(160),
  factCheckPassed: z.boolean(),
  informationGain: z.preprocess((value) => typeof value === "string" ? value.trim().toUpperCase() : value, z.enum(["LOW", "MEDIUM", "HIGH"])),
});

export type ArticleDraft = z.infer<typeof articleDraftSchema>;

export const imagePlanSchema = z.object({
  prompt: z.string().min(80).max(1200),
  alt: z.string().min(20).max(160),
  caption: z.string().max(180).optional(),
});

export type ArticleGenerationInput = {
  topic: NewsTopic;
  primaryKeyword: string;
  secondaryKeywords: string[];
  keywordMetrics?: Record<string, unknown>;
  serp?: SerpSnapshot;
  siteProfile: SiteNicheProfile;
  editorialProfile: EditorialProfile;
};

function sourceLines(input: ArticleGenerationInput) {
  const sources = [
    {
      title: input.topic.title,
      url: input.topic.source === "keyword-only" && isLocalUrl(input.topic.url) ? "" : input.topic.url,
      publisher: input.topic.publisher,
      dateAccessed: new Date(),
    },
    ...(input.serp?.rankingUrls ?? []).slice(0, 4).map((item) => ({
      title: item.title ?? item.domain ?? item.url,
      url: item.url,
      publisher: item.domain,
      dateAccessed: new Date(),
    })),
  ];
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (!source.url || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

function isLocalUrl(value?: string) {
  return Boolean(value && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value));
}

function publicSiteUrl(value?: string) {
  if (value && !isLocalUrl(value)) {
    try {
      const parsed = new URL(value);
      if (["http:", "https:"].includes(parsed.protocol)) return parsed.toString();
    } catch {
      // Use the validated site origin when a topic URL is malformed.
    }
  }
  return seoConfig.siteUrl;
}

export async function generateArticleDraft(input: ArticleGenerationInput) {
  try {
    return await runPromptStructuredTask({
      taskType: "SeniorWriter",
      variables: {
        input: {
          task: "Write a source-aware SEO technology article draft as JSON.",
          topic: input.topic,
          primaryKeyword: input.primaryKeyword,
          secondaryKeywords: input.secondaryKeywords,
          keywordMetrics: input.keywordMetrics ?? {},
          serp: input.serp ?? null,
          siteProfile: input.siteProfile,
          editorialProfile: input.editorialProfile,
          requirements: [
            "Return a single JSON object with exactly these top-level fields: title, slug, excerpt, seoTitle, metaDescription, category, tags, focusKeyword, secondaryKeywords, contentHtml, faqs, imageBrief, imageAlt, factCheckPassed, informationGain.",
            "Do not wrap the JSON inside draft, article, post, result, or output.",
            "Return HTML content using p, h2, h3, ul, li, strong, and a tags only.",
            "Use the primary keyword naturally in title, intro, one h2, meta description, and conclusion if it fits.",
            "Use secondary keywords naturally. Do not keyword stuff.",
            "Do not force every article into an SEO-services angle. Choose the angle from the source topic: AI, cybersecurity, cloud, software, startups, developer tools, or digital marketing.",
            "Write a specific headline based on the news/topic. Avoid repeated templates such as 'What it means for technology readers' unless it is clearly the best fit.",
            "Cite supplied sources with links where factual claims are made.",
            "Do not invent facts, quotes, dates, statistics, or source links.",
            "Set factCheckPassed false when source details still need editor review.",
          ],
        },
      },
      timeoutMs: 60000,
    }, articleDraftSchema);
  } catch (error) {
    throw new Error(`Article generation failed before a source-specific draft was created: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sentenceCase(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Technology update";
  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
}

function trimText(value: string, max: number) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const clipped = cleaned.slice(0, max);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 30 ? lastSpace : max - 1).trimEnd()}.`;
}

export function createFallbackReviewDraft(input: ArticleGenerationInput, reason: string): ArticleDraft {
  const topicTitle = sentenceCase(input.topic.title || input.primaryKeyword || "Technology update");
  const primaryKeyword = input.primaryKeyword || topicTitle;
  const sourceLabel = input.topic.publisher || "the available source";
  const sourceUrl = publicSiteUrl(input.topic.url);
  const safeTopic = escapeHtml(topicTitle);
  const safeKeyword = escapeHtml(primaryKeyword);
  const safeSourceLabel = escapeHtml(sourceLabel);
  const safeSourceUrl = escapeHtml(sourceUrl);
  const secondaryKeywords = Array.from(new Set([
    primaryKeyword,
    ...input.secondaryKeywords,
    input.siteProfile.primaryNiche,
    ...input.siteProfile.allowedTopics,
  ].filter(Boolean))).slice(0, 8);
  const title = trimText(topicTitle.length > 95 ? topicTitle : `${topicTitle}: A practical guide`, 110);
  const excerpt = trimText(`A practical overview of ${topicTitle}, written for ${input.siteProfile.targetAudience || "technology readers and business teams"}.`, 200);
  const metaDescription = trimText(`${topicTitle} explained with practical context for software, SEO, and business teams.`, 155);
  void reason;
  const contentHtml = [
    `<p><strong>${safeTopic}</strong> is relevant for readers tracking ${escapeHtml(input.siteProfile.primaryNiche)} because it connects daily technology decisions with how teams choose software, protect systems, and plan digital growth.</p>`,
    `<p>The practical question is simple: what should a reader understand before they change a workflow, test a new tool, or explain the topic to a client or team? A useful answer starts with context, then moves into decisions.</p>`,
    `<h2 id="what-this-topic-means">What this topic means</h2>`,
    `<p>The core topic is <strong>${safeKeyword}</strong>. For a practical technology audience, the useful angle is not hype. Readers need to understand what changed, who may be affected, and which decisions deserve attention before they invest time, budget, or engineering effort.</p>`,
    `<p>When the topic is tied to a current source, the most important details are the original announcement, the timing, and who is affected. When the topic is evergreen, the focus belongs on practical guidance rather than claims about a new event.</p>`,
    `<h2 id="why-teams-should-care">Why teams should care</h2>`,
    `<p>Software teams, SEO teams, and business owners often feel technology shifts first through workflow changes: new tools, new security expectations, new customer search behavior, or new operational costs. A useful article should translate the topic into plain-language decisions that readers can act on.</p>`,
    `<ul><li>Check whether the topic affects customer-facing websites, software workflows, or data handling.</li><li>Look for official documentation, product updates, or reliable reporting before making strong claims.</li><li>Explain practical next steps without promising guaranteed rankings, security outcomes, or business results.</li></ul>`,
    `<h2 id="what-to-check-next">What to check next</h2>`,
    `<p>The attached source context is <a href="${safeSourceUrl}">${safeSourceLabel}</a>. Reliable coverage stays focused on visible, verifiable details from the topic and avoids claims that are not supported by a clear source.</p>`,
    `<p>After review, the strongest version of this article should answer the reader quickly, keep the title natural, use related terms only where they fit, and avoid repeating the same phrase across headings and paragraphs.</p>`,
    `<h2 id="bottom-line">Bottom line</h2>`,
    `<p>${safeTopic} is worth covering when it helps readers make clearer software, SEO, security, or digital strategy decisions. The best version keeps the explanation specific, practical, and grounded in verifiable context.</p>`,
  ].join("");

  return {
    title,
    slug: compactPostSlug(primaryKeyword || title, title),
    excerpt,
    seoTitle: trimText(title, 68),
    metaDescription,
    category: input.topic.source === "keyword-only" ? input.siteProfile.primaryNiche : "Technology News",
    tags: secondaryKeywords.slice(0, 6),
    focusKeyword: primaryKeyword,
    secondaryKeywords,
    contentHtml,
    faqs: [
      {
        question: `What is ${topicTitle} about?`,
        answer: `It is a technology topic connected to ${primaryKeyword}, with practical relevance for software, SEO, and business teams.`,
      },
    ],
    imageBrief: `Create a clean editorial technology cover for an article about ${topicTitle}. Show a practical software workspace, subtle data and search context, balanced detail, no text overlay, no fake logos, no clutter.`,
    imageAlt: trimText(`Editorial technology cover for ${topicTitle}`, 150),
    factCheckPassed: false,
    informationGain: "LOW",
  };
}

export async function planFeaturedImage(draft: ArticleDraft, input: ArticleGenerationInput) {
  try {
    return await runPromptStructuredTask({
      taskType: "ImagePlanner",
      variables: {
        input: {
          title: draft.title,
          excerpt: draft.excerpt,
          primaryKeyword: draft.focusKeyword,
          articleBrief: draft.imageBrief,
          topic: input.topic,
          styleRules: [
            "modern editorial technology cover",
            "balanced detail, not too busy, not too minimal",
            "realistic or semi-realistic",
            "no fake logos, no real brand marks, no text overlay, no misleading UI",
            "suitable for a 16:9 website featured image crop",
          ],
        },
      },
      timeoutMs: 30000,
    }, imagePlanSchema);
  } catch {
    return {
      prompt: `Create a professional 16:9 editorial technology cover image for an article titled "${draft.title}". Show a modern software and SEO research workspace with a laptop, abstract data cards, and subtle technology news context. Keep it balanced, polished, realistic, and useful. Avoid fake logos, real brand marks, readable text, text overlays, misleading UI, dark hacker stereotypes, excessive neon, and clutter.`,
      alt: draft.imageAlt,
    };
  }
}

async function ensureAuthor() {
  const author = await AuthorModel.findOneAndUpdate(
    { slug: "bluespark-editorial-team" },
    {
      name: "Bluespark Editorial Team",
      slug: "bluespark-editorial-team",
      email: "editorial@wikibulz.com",
      bio: "The Bluespark editorial team covers software, SEO, cybersecurity, and practical technology trends.",
      jobTitle: "Technology Editorial Team",
      expertise: ["Software", "SEO", "Cybersecurity", "Technology News"],
      status: "active",
    },
    { upsert: true, returnDocument: "after" },
  );
  return String(author._id);
}

async function ensureCategory(name: string) {
  const slug = normalizeSlug(name || "Technology News");
  const category = await CategoryModel.findOneAndUpdate(
    { slug },
    {
      name: name || "Technology News",
      slug,
      description: "Technology news, software updates, cybersecurity, AI, and digital strategy.",
      indexStatus: "index",
    },
    { upsert: true, returnDocument: "after" },
  );
  return String(category._id);
}

async function ensureTags(names: string[]) {
  const ids: string[] = [];
  for (const name of names.slice(0, 8)) {
    const slug = normalizeSlug(name);
    if (!slug) continue;
    const tag = await TagModel.findOneAndUpdate({ slug }, { name, slug, indexStatus: "noindex" }, { upsert: true, returnDocument: "after" });
    ids.push(String(tag._id));
  }
  return ids;
}

export async function createOrUpdateAutomatedPost(input: {
  draft: ArticleDraft;
  generationInput: ArticleGenerationInput;
  featuredImage?: { url: string; alt: string; caption?: string };
  status: "draft" | "review" | "scheduled" | "published";
  scheduledAt?: Date;
}) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required to create automated posts.");
  const safeContent = ensureHeadingIds(sanitizeArticleHtml(input.draft.contentHtml));
  const author = await ensureAuthor();
  const category = await ensureCategory(input.draft.category);
  const tags = await ensureTags(input.draft.tags);
  const sources = sourceLines(input.generationInput);
  const image: { url: string; alt: string; caption?: string } = input.featuredImage ?? fallbackImage;
  await MediaAssetModel.updateOne(
    { url: image.url },
    { url: image.url, alt: image.alt, caption: image.caption, width: 1600, height: 900, provider: image.url.startsWith("http") ? "remote" : "local", usageReferences: [] },
    { upsert: true },
  );
  const slug = compactPostSlug(input.draft.focusKeyword || input.draft.slug || input.draft.title, input.draft.title);
  const sameTitlePost = await PostModel.findOne({ title: input.draft.title, status: { $ne: "trash" } }).sort({ updatedAt: -1 }).select("slug publicId").lean<{ slug?: string; publicId?: string }>();
  const existingPost = await PostModel.findOne({ slug }).select("status robotsIndex publicId").lean<{ status?: string; robotsIndex?: boolean; publicId?: string }>();
  const publishableSlug = sameTitlePost?.slug ?? (existingPost && (existingPost.status === "trash" || existingPost.status === "archived" || existingPost.robotsIndex === false)
    ? `${slug}-${Date.now().toString(36).slice(-6)}`
    : slug);
  return PostModel.findOneAndUpdate(
    { slug: publishableSlug },
    {
      title: input.draft.title,
      slug: publishableSlug,
      // Retain the identifier only for updates to legacy posts. New automated
      // posts use their editorial slug as the complete public URL.
      publicId: sameTitlePost?.publicId ?? existingPost?.publicId,
      excerpt: input.draft.excerpt,
      content: safeContent,
      featuredImage: { url: image.url, alt: image.alt, width: 1600, height: 900, caption: image.caption },
      author,
      category,
      tags,
      status: input.status,
      publishedAt: input.status === "published" ? new Date() : undefined,
      scheduledAt: input.scheduledAt,
      seoTitle: input.draft.seoTitle,
      metaDescription: input.draft.metaDescription,
      robotsIndex: true,
      robotsFollow: true,
      focusKeyword: input.draft.focusKeyword,
      secondaryKeywords: input.draft.secondaryKeywords,
      schemaType: input.generationInput.topic.source === "google-news-rss" || input.generationInput.topic.source === "gdelt" ? "NewsArticle" : "BlogPosting",
      featured: false,
      editorPick: false,
      readingTime: calculateReadingMinutes(safeContent),
      wordCount: calculateWordCount(safeContent),
      tableOfContents: generateTableOfContents(safeContent),
      sources,
      references: sources.slice(1),
      faqs: input.draft.faqs,
      reviewedBy: input.draft.factCheckPassed ? "Bluespark Editorial Team" : undefined,
      lastReviewedAt: input.draft.factCheckPassed ? new Date() : undefined,
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );
}
