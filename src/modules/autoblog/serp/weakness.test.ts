import { describe, expect, it } from "vitest";
import { scoreSerpWeakness } from "@/modules/autoblog/serp/weakness";

describe("SERP weakness scoring", () => {
  it("detects weak community-heavy results and question demand", () => {
    const result = scoreSerpWeakness({
      keyword: "best index funds for beginners",
      country: "US",
      language: "en",
      rankingUrls: [
        { url: "https://reddit.com/r/investing/post", title: "Beginner index funds" },
        { url: "https://example.com/forum/index-funds", title: "Forum answer" },
      ],
      features: ["featured_snippet"],
      peopleAlsoAsk: ["What is an index fund?", "How many funds?", "Are index funds safe?"],
      relatedSearches: [],
      capturedAt: new Date().toISOString(),
    });

    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.reasons.length).toBeGreaterThan(1);
  });
});
