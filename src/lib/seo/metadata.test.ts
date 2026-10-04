import { describe, expect, it } from "vitest";
import { generateCategoryMetadata, generatePostMetadata } from "./metadata";
import { resolveCategoryCanonical } from "./url";
import { categoryFormSchema } from "@/lib/validation/content";
import { posts } from "@/lib/content/sample-data";
import { seoConfig } from "@/config/seo";

describe("category canonical metadata", () => {
  it("matches the shared category canonical resolver for custom canonicals", () => {
    const category = {
      id: "category-healthcare",
      name: "Healthcare",
      slug: "healthcare",
      description: "City-wise healthcare discovery guides.",
      canonicalUrl: "http://localhost:3000/topics/healthcare/",
      indexStatus: "index" as const,
    };
    const metadata = generateCategoryMetadata(category);
    expect(metadata.alternates?.canonical).toBe(resolveCategoryCanonical(category));
  });

  it("rejects an external custom canonical at content validation", () => {
    expect(() => categoryFormSchema.parse({
      name: "Healthcare",
      slug: "healthcare",
      description: "City-wise healthcare discovery guides.",
      canonicalUrl: "https://evil.example/topics/healthcare",
      indexStatus: "index",
    })).toThrow(/configured origin/i);
  });

  it("uses the official article URL for canonical and Open Graph metadata", () => {
    const post = {
      ...posts[0],
      slug: "best-dentists-in-lucknow",
      category: { ...posts[0].category, slug: "dentists", categoryPath: undefined },
      canonicalUrl: `${seoConfig.siteUrl}/`,
    };
    const expected = `${seoConfig.siteUrl}/best-dentists-in-lucknow`;
    const metadata = generatePostMetadata(post);
    expect(metadata.alternates?.canonical).toBe(expected);
    expect(metadata.openGraph && "url" in metadata.openGraph ? metadata.openGraph.url : undefined).toBe(expected);
  });
});
