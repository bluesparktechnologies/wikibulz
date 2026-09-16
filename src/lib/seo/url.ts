import { randomBytes } from "node:crypto";
import slugify from "slugify";
import { seoConfig } from "@/config/seo";
import type { Category, Post } from "@/types/content";

export { normalizeCategorySlug } from "@/lib/seo/category-slug";

export type ArticleUrlStrategy = "category-post" | "post-only";
export function normalizeSlug(input: string) { return slugify(input.replace(/[^\w\s-]/g, ""), { lower: true, strict: true, trim: true }); }
const slugStopWords = new Set(["a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "for", "from", "has", "have", "how", "in", "into", "is", "it", "its", "new", "now", "of", "on", "or", "our", "that", "the", "their", "this", "to", "we", "what", "when", "where", "which", "who", "why", "will", "with", "you", "your"]);
export function compactPostSlug(input: string, fallback = "technology-update", maxWords = 7, maxLength = 72) {
  const normalized = normalizeSlug(input || fallback);
  const meaningful = normalized.split("-").filter((word) => word && !slugStopWords.has(word));
  const selected = (meaningful.length >= 3 ? meaningful : normalized.split("-").filter(Boolean)).slice(0, maxWords);
  let slug = selected.join("-") || normalizeSlug(fallback);
  if (slug.length > maxLength) {
    const clipped = slug.slice(0, maxLength);
    slug = clipped.slice(0, Math.max(clipped.lastIndexOf("-"), 24)).replace(/-+$/g, "");
  }
  return slug || "technology-update";
}
export function normalizePathname(path: string) { const normalized = path.toLowerCase().replace(/\/{2,}/g, "/").replace(/\/$/, ""); return normalized === "" ? "/" : normalized; }
export function normalizePath(path: string) { return normalizePathname(path.split("?")[0]); }
export function normalizeRedirectDestination(path: string) {
  const [pathname, query = ""] = path.split("?");
  const normalizedPath = normalizePathname(pathname);
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}
export function absoluteUrl(path: string) { return path.startsWith("http://") || path.startsWith("https://") ? path : seoConfig.siteUrl + (path.startsWith("/") ? path : "/" + path); }
type PostUrlInput = Pick<Post, "slug" | "publicId"> & { category?: Pick<Category, "slug" | "categoryPath"> };

export function categoryPath(category: Pick<Category, "slug" | "categoryPath">) {
  return category.categoryPath?.length ? category.categoryPath : [category.slug];
}

export function buildPostUrl(post: PostUrlInput, strategy: ArticleUrlStrategy = "category-post") {
  const baseSlug = post?.slug || "";
  // publicId is a legacy compatibility field. It is retained for existing
  // posts so their already-published URLs keep working, but new posts do not
  // receive one and therefore resolve to the editorial slug alone.
  const publicId = "publicId" in post && typeof post.publicId === "string" ? post.publicId : "";
  const slug = publicId && !baseSlug.endsWith(`-${publicId}`) ? `${baseSlug}-${publicId}` : baseSlug;
  if (strategy === "post-only" || !post?.category?.slug) return "/" + slug;
  return "/" + categoryPath(post.category).join("/") + "/" + slug;
}
export function matchesPostSlug(post: Pick<Post, "slug" | "publicId">, candidate: string) {
  return post.slug === candidate || Boolean(post.publicId && `${post.slug}-${post.publicId}` === candidate);
}
export function createPublicId() { return randomBytes(5).toString("base64url").slice(0, 7); }
export function buildCategoryUrl(category: Pick<Category, "slug">) { return "/category/" + category.slug; }
export function isSameOriginCanonical(value: string) {
  try {
    const candidate = new URL(value, seoConfig.siteUrl);
    const site = new URL(seoConfig.siteUrl);
    return candidate.origin === site.origin && !candidate.username && !candidate.password;
  } catch {
    return false;
  }
}
export function buildCanonicalUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    if (!isSameOriginCanonical(pathOrUrl)) return absoluteUrl("/");
    const url = new URL(pathOrUrl);
    url.pathname = normalizePathname(url.pathname);
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  }
  return absoluteUrl(normalizePath(pathOrUrl));
}
export function resolveCanonicalUrl(candidate: string | undefined, fallback: string) { return candidate && isSameOriginCanonical(candidate) ? buildCanonicalUrl(candidate) : buildCanonicalUrl(fallback); }
function isSiteRootUrl(value: string) {
  try {
    const candidate = new URL(value);
    const site = new URL(seoConfig.siteUrl);
    return candidate.origin === site.origin && normalizePathname(candidate.pathname) === "/";
  } catch {
    return false;
  }
}
export function resolvePostCanonical(post: Pick<Post, "slug" | "category" | "canonicalUrl">) {
  const fallback = absoluteUrl(buildPostUrl(post));
  if (!post.canonicalUrl || !isSameOriginCanonical(post.canonicalUrl)) return fallback;
  const resolved = buildCanonicalUrl(post.canonicalUrl);
  return isSiteRootUrl(resolved) ? fallback : resolved;
}
export function resolveCategoryCanonical(category: Pick<Category, "slug" | "canonicalUrl">, page = 1) {
  const fallback = page > 1 ? `${buildCategoryUrl(category)}?page=${page}` : buildCategoryUrl(category);
  return page > 1 ? buildCanonicalUrl(fallback) : resolveCanonicalUrl(category.canonicalUrl, fallback);
}
