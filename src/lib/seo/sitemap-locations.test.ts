import { describe, expect, it, vi } from "vitest";
import { seoConfig } from "@/config/seo";

vi.mock("@/repositories/content.repository", () => ({
  getCountries: vi.fn(async () => [{
    id: "country-india",
    name: "India",
    slug: "india",
    canonicalUrl: `${seoConfig.siteUrl}/location/india`,
    status: "active",
    indexStatus: "index",
    updatedAt: "2026-10-05T08:41:13.197Z",
  }]),
  getStates: vi.fn(async () => []),
  getCities: vi.fn(async () => []),
  getPostsByLocation: vi.fn(async () => [{ id: "post-1" }]),
}));

import { GET } from "@/app/sitemap-locations.xml/route";

describe("location sitemap canonicals", () => {
  it("emits the clean public location URL instead of legacy /location paths", async () => {
    const response = await GET();
    const xml = await response.text();

    expect(xml).not.toContain("/location/india");
    expect(xml).toContain(`${seoConfig.siteUrl}/india`);
  });
});
