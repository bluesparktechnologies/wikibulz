import { describe, expect, it, vi } from "vitest";
import { seoConfig } from "@/config/seo";

vi.mock("@/repositories/content.repository", () => ({
  getPublishedPosts: vi.fn(async () => [{
    slug: "best-dentists-in-bareilly", category: { slug: "dentists", categoryPath: ["healthcare", "dentists"] },
    canonicalUrl: `${seoConfig.siteUrl}/`, updatedAt: "2026-10-08T08:00:00.000Z", featured: true,
    featuredImage: { url: "/images/dentist.jpg", alt: "Dentist & clinic" },
  }]),
  getStaticPages: vi.fn(async () => []),
  getCategories: vi.fn(async () => [{ slug: "healthcare", indexStatus: "index", canonicalUrl: "https://evil.example/healthcare" }]),
  getAuthors: vi.fn(async () => [{ slug: "editorial-team", status: "active", updatedAt: "2026-10-08T08:00:00.000Z" }]),
  getPostsByAuthor: vi.fn(async () => [{ id: "post-1" }]),
  getCountries: vi.fn(async () => [{ slug: "india", canonicalUrl: `${seoConfig.siteUrl}/location/india`, status: "active", indexStatus: "index", updatedAt: "2026-10-08T08:00:00.000Z" }]),
  getStates: vi.fn(async () => []),
  getCities: vi.fn(async () => []),
  getPostsByLocation: vi.fn(async () => [{ id: "post-1" }]),
}));

import { GET } from "@/app/sitemap.xml/route";

describe("single sitemap", () => {
  it("lists indexable pages, posts, categories, locations, and authors in one URL set", async () => {
    const response = await GET();
    const xml = await response.text();

    expect(response.headers.get("content-type")).toContain("application/xml");
    expect(xml).toContain("<urlset ");
    expect(xml).not.toContain("<sitemapindex");
    expect(xml).toContain(`<loc>${seoConfig.siteUrl}/best-dentists-in-bareilly</loc>`);
    expect(xml).toContain(`<loc>${seoConfig.siteUrl}/category/healthcare</loc>`);
    expect(xml).toContain(`<loc>${seoConfig.siteUrl}/india</loc>`);
    expect(xml).toContain(`<loc>${seoConfig.siteUrl}/author/editorial-team</loc>`);
    expect(xml).toContain(`<image:title>Dentist &amp; clinic</image:title>`);
    expect(xml).not.toContain("evil.example");
    expect(xml).not.toContain("/location/india");
    expect(xml).not.toContain("sitemap-posts-1.xml");
  });
});
