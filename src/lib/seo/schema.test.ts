import { describe, expect, it } from "vitest";
import { posts } from "@/lib/content/sample-data";
import { seoConfig } from "@/config/seo";
import { articleSchema, breadcrumbSchema, faqSchema } from "./schema";
import { resolvePostCanonical } from "./url";
describe("JSON-LD generation", () => {
  it("serializes article schema without undefined values", () => { const json = JSON.stringify(articleSchema(posts[0])); expect(json).toContain("BlogPosting"); expect(json).not.toContain("undefined"); });
  it("uses stable organization identity and the resolved canonical URL", () => { const schema = articleSchema({ ...posts[0], canonicalUrl: "/best-dentists-in-lucknow/" }); expect(schema.publisher["@id"]).toContain("#organization"); expect(schema.url).toContain("/best-dentists-in-lucknow"); expect(schema.mainEntityOfPage["@id"]).toBe(schema.url); });
  it("falls back from a homepage canonical to the article URL", () => {
    const post = { ...posts[0], slug: "best-dentists-in-lucknow", category: { ...posts[0].category, slug: "dentists", categoryPath: undefined }, canonicalUrl: `${seoConfig.siteUrl}/` };
    const schema = articleSchema(post);
    expect(schema.url).toBe(`${seoConfig.siteUrl}/best-dentists-in-lucknow`);
    expect(schema.mainEntityOfPage["@id"]).toBe(resolvePostCanonical(post));
  });
  it("matches visible breadcrumb order", () => { const schema = breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Healthcare", url: "/category/healthcare" }]); expect(schema.itemListElement[1].name).toBe("Healthcare"); });
  it("adds answer-engine and local entity signals to article schema", () => {
    const schema = articleSchema(posts[0]) as Record<string, unknown>;
    expect(schema.inLanguage).toBe("en-IN");
    expect(schema.isAccessibleForFree).toBe(true);
    expect(JSON.stringify(schema.about)).toContain("Lucknow");
    expect(JSON.stringify(schema.about)).toContain("Dentists");
    expect(JSON.stringify(schema.spatialCoverage)).toContain("Lucknow");
  });
  it("only emits FAQ schema when FAQs exist", () => { expect(faqSchema(posts[0])).not.toBeNull(); expect(faqSchema({ ...posts[1], faqs: [] })).toBeNull(); });
});
