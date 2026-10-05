import { z } from "zod";
import { normalizeCategorySlug } from "@/lib/seo/category-slug";
import { normalizePostSlug } from "@/lib/seo/post-slug";
import { isSameOriginCanonical, normalizePath } from "@/lib/seo/url";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
function normalizeRedirectDestination(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return new URL(trimmed).toString();
  return normalizePath(trimmed);
}
export const canonicalUrlSchema = z.preprocess(emptyToUndefined, z.string().url().refine(isSameOriginCanonical, "Canonical URL must use this site's configured origin.").optional());
const imageUrlSchema = z.string().min(1).refine((value) => value.startsWith("/") || z.string().url().safeParse(value).success, "Enter a valid image URL.");
export const postSlugSchema = z.preprocess(
  (value) => typeof value === "string" ? normalizePostSlug(value) : value,
  z.string()
    .min(3, "Slug must be at least 3 characters.")
    .max(160, "Slug must be 160 characters or fewer."),
);

export const mediaSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(3),
  width: z.coerce.number().int().positive().default(1600),
  height: z.coerce.number().int().positive().default(900),
  caption: z.preprocess(emptyToUndefined, z.string().optional()),
  credit: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const sourceSchema = z.object({
  title: z.string().min(2),
  url: z.string().url(),
  publisher: z.preprocess(emptyToUndefined, z.string().optional()),
  dateAccessed: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const postFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(180, "Title must be 180 characters or fewer."),
  slug: postSlugSchema,
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters.").max(500, "Excerpt must be 500 characters or fewer."),
  content: z.string().min(80, "Article body must be at least 80 characters."),
  featuredImageUrl: z.preprocess(emptyToUndefined, imageUrlSchema.optional()),
  featuredImageAlt: z.preprocess(emptyToUndefined, z.string().max(180).optional()),
  author: z.string().min(1, "Select an author."),
  country: z.preprocess(emptyToUndefined, z.string().optional()),
  state: z.preprocess(emptyToUndefined, z.string().optional()),
  city: z.preprocess(emptyToUndefined, z.string().optional()),
  category: z.string().min(1, "Select a category."),
  status: z.enum(["draft", "review", "scheduled", "published", "archived", "trash"]),
  publishedAt: z.preprocess(emptyToUndefined, z.string().optional()),
  scheduledAt: z.preprocess(emptyToUndefined, z.string().optional()),
  seoTitle: z.preprocess(emptyToUndefined, z.string().max(65).optional()),
  metaDescription: z.preprocess(emptyToUndefined, z.string().max(170).optional()),
  canonicalUrl: canonicalUrlSchema,
  ogTitle: z.preprocess(emptyToUndefined, z.string().max(95).optional()),
  ogDescription: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  ogImageUrl: z.preprocess(emptyToUndefined, imageUrlSchema.optional()),
  ogImageAlt: z.preprocess(emptyToUndefined, z.string().max(180).optional()),
  twitterTitle: z.preprocess(emptyToUndefined, z.string().max(95).optional()),
  twitterDescription: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  twitterImageUrl: z.preprocess(emptyToUndefined, imageUrlSchema.optional()),
  twitterImageAlt: z.preprocess(emptyToUndefined, z.string().max(180).optional()),
  robotsIndex: z.coerce.boolean().default(true),
  robotsFollow: z.coerce.boolean().default(true),
  focusKeyword: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
  secondaryKeywords: z.preprocess(
    emptyToUndefined,
    z.string().optional().transform((value) => value?.split(",").map((item) => item.trim()).filter(Boolean) ?? []),
  ),
  newTags: z.preprocess(
    emptyToUndefined,
    z.string().optional().transform((value) => value?.split(",").map((item) => item.trim()).filter(Boolean) ?? []),
  ),
  schemaType: z.enum(["Article", "BlogPosting", "NewsArticle"]).default("BlogPosting"),
  reviewer: z.preprocess(emptyToUndefined, z.string().optional()),
  factCheckedBy: z.preprocess(emptyToUndefined, z.string().optional()),
  reviewedBy: z.preprocess(emptyToUndefined, z.string().max(120).optional()),
  lastReviewedAt: z.preprocess(emptyToUndefined, z.string().optional()),
  sourcesRaw: z.preprocess(emptyToUndefined, z.string().optional()),
  referencesRaw: z.preprocess(emptyToUndefined, z.string().optional()),
  faqsRaw: z.preprocess(emptyToUndefined, z.string().optional()),
  featured: z.coerce.boolean().default(false),
  editorPick: z.coerce.boolean().default(false),
});

export const categoryFormSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).refine((value) => normalizeCategorySlug(value).length >= 2, "Enter a valid category slug.").transform(normalizeCategorySlug),
  description: z.string().min(30).max(1000),
  parentCategory: z.preprocess(emptyToUndefined, z.string().optional()),
  seoTitle: z.preprocess(emptyToUndefined, z.string().max(65).optional()),
  metaDescription: z.preprocess(emptyToUndefined, z.string().max(170).optional()),
  canonicalUrl: canonicalUrlSchema,
  indexStatus: z.enum(["index", "noindex"]).default("index"),
});

export const locationFormSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).transform(normalizeCategorySlug),
  description: z.string().min(20).max(1000),
  seoTitle: z.preprocess(emptyToUndefined, z.string().max(65).optional()),
  metaDescription: z.preprocess(emptyToUndefined, z.string().max(170).optional()),
  canonicalUrl: canonicalUrlSchema,
  indexStatus: z.enum(["index", "noindex"]).default("index"),
  status: z.enum(["active", "inactive"]).default("active"),
  country: z.preprocess(emptyToUndefined, z.string().optional()),
  state: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const redirectFormSchema = z.object({
  sourcePath: z.string().min(1).transform(normalizePath),
  destinationPath: z.string().min(1).transform(normalizeRedirectDestination),
  statusCode: z.coerce.number().pipe(z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)])),
  active: z.coerce.boolean().default(true),
});
