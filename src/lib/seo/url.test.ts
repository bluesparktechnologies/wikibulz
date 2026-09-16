import { describe, expect, it } from "vitest";
import { seoConfig } from "@/config/seo";
import { buildCanonicalUrl, buildPostUrl, matchesPostSlug, normalizeCategorySlug, normalizePath, normalizeRedirectDestination, normalizeSlug, resolveCategoryCanonical, resolveCanonicalUrl, resolvePostCanonical } from "./url";
describe("SEO URL utilities", () => {
  it("normalizes slugs", () => { expect(normalizeSlug("How to Invest in Mutual Funds!")).toBe("how-to-invest-in-mutual-funds"); });
  it("preserves slash-separated category slug paths", () => { expect(normalizeCategorySlug("Arpit//Sharma/")).toBe("arpit/sharma"); });
  it("removes query strings, uppercase, duplicate slashes, and trailing slashes", () => { expect(normalizePath("/Investing//Best-Index-Funds/?utm=1")).toBe("/investing/best-index-funds"); });
  it("builds absolute canonicals", () => { expect(buildCanonicalUrl("/Investing/Funds?x=1")).toContain("/investing/funds"); });
  it("preserves redirect query strings while normalizing the pathname", () => { expect(normalizeRedirectDestination("/Old//Path/?utm_source=newsletter")).toBe("/old/path?utm_source=newsletter"); });
  it("uses one safe resolver for same-origin category canonicals", () => {
    const category = { slug: "investing", canonicalUrl: `${seoConfig.siteUrl}/topics/investing/?utm_source=editor` };
    expect(resolveCategoryCanonical(category)).toBe(`${seoConfig.siteUrl}/topics/investing`);
    expect(resolveCanonicalUrl(category.canonicalUrl, "/category/investing")).toBe(resolveCategoryCanonical(category));
  });
  it("falls back to the official URL for external canonicals", () => {
    const category = { slug: "investing", canonicalUrl: "https://evil.example/category/investing" };
    expect(resolveCategoryCanonical(category)).toBe(`${seoConfig.siteUrl}/category/investing`);
    expect(buildCanonicalUrl("https://evil.example/category/investing")).toBe(`${seoConfig.siteUrl}/`);
  });
  it("uses the editorial slug for new posts and retains legacy public IDs", () => {
    const category = { slug: "technical-seo" };
    expect(buildPostUrl({ slug: "social-media-seo", category })).toBe("/technical-seo/social-media-seo");
    expect(buildPostUrl({ slug: "older-guide", publicId: "abc1234", category })).toBe("/technical-seo/older-guide-abc1234");
  });
  it("includes populated parent categories in article URLs", () => {
    const category = { slug: "obzor-smi", categoryPath: ["infowar", "obzor-smi"] };
    expect(buildPostUrl({ slug: "111-razvedsluzhby-otkazalis-ot-lenovo", category })).toBe("/infowar/obzor-smi/111-razvedsluzhby-otkazalis-ot-lenovo");
  });
  it("uses slash-separated category slugs in article URLs", () => {
    expect(buildPostUrl({ slug: "article-slug", category: { slug: "arpit/sharma" } })).toBe("/arpit/sharma/article-slug");
  });
  it("never lets a stored homepage canonical replace an article URL", () => {
    const post = {
      slug: "social-media-seo-strategy-1aYEW-w",
      category: { id: "technical-seo", name: "Technical SEO", slug: "technical-seo", description: "Technical SEO articles.", indexStatus: "index" as const },
      canonicalUrl: `${seoConfig.siteUrl}/`,
    };
    expect(resolvePostCanonical(post)).toBe(`${seoConfig.siteUrl}/technical-seo/social-media-seo-strategy-1aYEW-w`);
  });
  it("resolves both new slug-only URLs and legacy identifier URLs", () => {
    const newPost = { slug: "social-media-seo" };
    const legacyPost = { slug: "older-guide", publicId: "abc1234" };
    expect(matchesPostSlug(newPost, "social-media-seo")).toBe(true);
    expect(matchesPostSlug(newPost, "social-media-seo-abc1234")).toBe(false);
    expect(matchesPostSlug(legacyPost, "older-guide")).toBe(true);
    expect(matchesPostSlug(legacyPost, "older-guide-abc1234")).toBe(true);
  });
});
