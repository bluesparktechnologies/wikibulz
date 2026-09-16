import { describe, expect, it } from "vitest";
import { generateCategoryMetadata, generatePostMetadata } from "./metadata";
import { resolveCategoryCanonical } from "./url";
import { categoryFormSchema } from "@/lib/validation/content";
import { posts } from "@/lib/content/sample-data";
import { seoConfig } from "@/config/seo";

describe("category canonical metadata", () => {
  it("matches the shared category canonical resolver for custom canonicals", () => {
    const category = {
      id: "category-investing",
      name: "Investing",
      slug: "investing",
      description: "Evidence-based investing guidance for long-term decisions.",
      canonicalUrl: "http://localhost:3000/topics/investing/",
      indexStatus: "index" as const,
    };
    const metadata = generateCategoryMetadata(category);
    expect(metadata.alternates?.canonical).toBe(resolveCategoryCanonical(category));
  });

  it("rejects an external custom canonical at content validation", () => {
    expect(() => categoryFormSchema.parse({
      name: "Investing",
      slug: "investing",
      description: "Evidence-based investing guidance for long-term decisions.",
      canonicalUrl: "https://evil.example/topics/investing",
      indexStatus: "index",
    })).toThrow(/configured origin/i);
  });

  it("uses the official article URL for canonical and Open Graph metadata", () => {
    const post = {
      ...posts[0],
      slug: "social-media-seo-strategy-1aYEW-w",
      category: { ...posts[0].category, slug: "technical-seo", categoryPath: undefined },
      canonicalUrl: `${seoConfig.siteUrl}/`,
    };
    const expected = `${seoConfig.siteUrl}/technical-seo/social-media-seo-strategy-1aYEW-w`;
    const metadata = generatePostMetadata(post);
    expect(metadata.alternates?.canonical).toBe(expected);
    expect(metadata.openGraph && "url" in metadata.openGraph ? metadata.openGraph.url : undefined).toBe(expected);
  });
});
