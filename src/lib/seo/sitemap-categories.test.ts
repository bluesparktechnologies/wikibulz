import { describe, expect, it, vi } from "vitest";
import { seoConfig } from "@/config/seo";

vi.mock("@/repositories/content.repository", () => ({
  getPublishedPosts: vi.fn(async () => [{ category: { slug: "healthcare" } }]),
  getCategories: vi.fn(async () => [{
    id: "category-healthcare",
    name: "Healthcare",
    slug: "healthcare",
    description: "City-wise healthcare discovery guides.",
    canonicalUrl: "https://evil.example/topics/healthcare",
    indexStatus: "index",
  }]),
}));

import { GET } from "@/app/sitemap-categories.xml/route";

describe("category sitemap canonicals", () => {
  it("never emits an external custom canonical", async () => {
    const response = await GET();
    const xml = await response.text();

    expect(xml).not.toContain("evil.example");
    expect(xml).toContain(`${seoConfig.siteUrl}/category/healthcare`);
  });
});
