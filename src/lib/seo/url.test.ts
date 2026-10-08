import { describe, expect, it } from "vitest";
import { seoConfig } from "@/config/seo";
import { buildCanonicalUrl, buildPostUrl, matchesPostSlug, normalizeCategorySlug, normalizePath, normalizeRedirectDestination, normalizeSlug, resolveCategoryCanonical, resolveCanonicalUrl, resolveLocationCanonical, resolvePostCanonical } from "./url";
describe("SEO URL utilities", () => {
  it("normalizes slugs", () => { expect(normalizeSlug("Best Dentists in Lucknow!")).toBe("best-dentists-in-lucknow"); });
  it("preserves slash-separated category slug paths", () => { expect(normalizeCategorySlug("Arpit//Sharma/")).toBe("arpit/sharma"); });
  it("removes query strings, uppercase, duplicate slashes, and trailing slashes", () => { expect(normalizePath("/Healthcare//Best-Dentists/?utm=1")).toBe("/healthcare/best-dentists"); });
  it("builds absolute canonicals", () => { expect(buildCanonicalUrl("/Healthcare/Dentists?x=1")).toContain("/healthcare/dentists"); });
  it("preserves redirect query strings while normalizing the pathname", () => { expect(normalizeRedirectDestination("/Old//Path/?utm_source=newsletter")).toBe("/old/path?utm_source=newsletter"); });
  it("uses one safe resolver for same-origin category canonicals", () => {
    const category = { slug: "healthcare", canonicalUrl: `${seoConfig.siteUrl}/topics/healthcare/?utm_source=editor` };
    expect(resolveCategoryCanonical(category)).toBe(`${seoConfig.siteUrl}/topics/healthcare`);
    expect(resolveCanonicalUrl(category.canonicalUrl, "/category/healthcare")).toBe(resolveCategoryCanonical(category));
  });
  it("falls back to the official URL for external canonicals", () => {
    const category = { slug: "healthcare", canonicalUrl: "https://evil.example/category/healthcare" };
    expect(resolveCategoryCanonical(category)).toBe(`${seoConfig.siteUrl}/category/healthcare`);
    expect(buildCanonicalUrl("https://evil.example/category/healthcare")).toBe(`${seoConfig.siteUrl}/`);
  });
  it("uses the editorial slug for new posts and retains legacy public IDs", () => {
    const category = { slug: "dentists" };
    expect(buildPostUrl({ slug: "best-dentists-in-lucknow", category })).toBe("/best-dentists-in-lucknow");
    expect(buildPostUrl({ slug: "older-guide", publicId: "abc1234", category })).toBe("/older-guide-abc1234");
    expect(buildPostUrl({ slug: "older-guide", publicId: "abc1234", category }, "category-post")).toBe("/dentists/older-guide-abc1234");
  });
  it("includes populated parent categories in article URLs", () => {
    const category = { slug: "dentists", categoryPath: ["healthcare", "dentists"] };
    expect(buildPostUrl({ slug: "best-dentists-in-lucknow", category }, "category-post")).toBe("/healthcare/dentists/best-dentists-in-lucknow");
  });
  it("uses slash-separated category slugs in article URLs", () => {
    expect(buildPostUrl({ slug: "article-slug", category: { slug: "arpit/sharma" } }, "category-post")).toBe("/arpit/sharma/article-slug");
  });
  it("never lets a stored homepage canonical replace an article URL", () => {
    const post = {
      slug: "best-dentists-in-lucknow",
      category: { id: "dentists", name: "Dentists", slug: "dentists", description: "Local dentist guides.", indexStatus: "index" as const },
      canonicalUrl: `${seoConfig.siteUrl}/`,
    };
    expect(resolvePostCanonical(post)).toBe(`${seoConfig.siteUrl}/best-dentists-in-lucknow`);
  });
  it("resolves an empty article canonical to its own public URL", () => {
    const post = {
      slug: "best-orthodontist-in-bareilly",
      canonicalUrl: undefined,
      category: { id: "dentists", name: "Dentists", slug: "dentists", description: "Dental guides", indexStatus: "index" as const },
    };
    expect(resolvePostCanonical(post)).toBe(`${seoConfig.siteUrl}/best-orthodontist-in-bareilly`);
  });
  it("ignores legacy location canonicals that include the removed location prefix", () => {
    expect(resolveLocationCanonical({ slug: "bareilly", canonicalUrl: `${seoConfig.siteUrl}/location/india/uttar-pradesh/bareilly` })).toBe(`${seoConfig.siteUrl}/bareilly`);
  });
  it("resolves both new slug-only URLs and legacy identifier URLs", () => {
    const newPost = { slug: "best-dentists-in-lucknow" };
    const legacyPost = { slug: "older-guide", publicId: "abc1234" };
    expect(matchesPostSlug(newPost, "best-dentists-in-lucknow")).toBe(true);
    expect(matchesPostSlug(newPost, "best-dentists-in-lucknow-abc1234")).toBe(false);
    expect(matchesPostSlug(legacyPost, "older-guide")).toBe(true);
    expect(matchesPostSlug(legacyPost, "older-guide-abc1234")).toBe(true);
  });
});
