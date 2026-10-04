import { describe, expect, it } from "vitest";
import { seoConfig } from "@/config/seo";
import { createFallbackReviewDraft } from "@/modules/autoblog/content/article-generator";

describe("autoblog public origin safety", () => {
  it("uses the configured site origin for local or malformed fallback source URLs", () => {
    const draft = createFallbackReviewDraft({
      topic: {
        title: "A local guide planning topic",
        url: "http://localhost:3000/",
        publisher: "Editorial planning",
        publishedAt: new Date().toISOString(),
        snippet: "A practical topic.",
        source: "keyword-only",
        score: 20,
      },
      primaryKeyword: "local guide planning",
      secondaryKeywords: ["service comparison"],
      siteProfile: { primaryNiche: "local rankings", targetAudience: "local service readers", allowedTopics: ["healthcare"] } as never,
      editorialProfile: {} as never,
    }, "test fallback");

    expect(draft.contentHtml).toContain(`href="${seoConfig.siteUrl}"`);
    expect(draft.contentHtml).not.toContain("bluespark");
  });
});
