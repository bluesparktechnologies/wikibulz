import { describe, expect, it } from "vitest";
import { posts } from "@/lib/content/sample-data";
import { seoConfig } from "@/config/seo";
import { articleSchema, breadcrumbSchema, faqSchema } from "./schema";
import { resolvePostCanonical } from "./url";
describe("JSON-LD generation", () => {
  it("serializes article schema without undefined values", () => { const json = JSON.stringify(articleSchema(posts[0])); expect(json).toContain("BlogPosting"); expect(json).not.toContain("undefined"); });
  it("uses stable organization identity and the resolved canonical URL", () => { const schema = articleSchema({ ...posts[0], canonicalUrl: "/investing/custom-index-funds/" }); expect(schema.publisher["@id"]).toContain("#organization"); expect(schema.url).toContain("/investing/custom-index-funds"); expect(schema.mainEntityOfPage["@id"]).toBe(schema.url); });
  it("falls back from a homepage canonical to the article URL", () => {
    const post = { ...posts[0], slug: "social-media-seo-strategy-1aYEW-w", category: { ...posts[0].category, slug: "technical-seo", categoryPath: undefined }, canonicalUrl: `${seoConfig.siteUrl}/` };
    const schema = articleSchema(post);
    expect(schema.url).toBe(`${seoConfig.siteUrl}/technical-seo/social-media-seo-strategy-1aYEW-w`);
    expect(schema.mainEntityOfPage["@id"]).toBe(resolvePostCanonical(post));
  });
  it("matches visible breadcrumb order", () => { const schema = breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Investing", url: "/category/investing" }]); expect(schema.itemListElement[1].name).toBe("Investing"); });
  it("only emits FAQ schema when FAQs exist", () => { expect(faqSchema(posts[0])).not.toBeNull(); expect(faqSchema(posts[1])).toBeNull(); });
});
