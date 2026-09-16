import { describe, expect, it } from "vitest";
import { sanitizeArticleHtml } from "./analysis";

describe("sanitizeArticleHtml", () => {
  it("renders HTML tags that were pasted as escaped text", () => {
    const html = sanitizeArticleHtml("&lt;h2&gt;A heading&lt;/h2&gt;&lt;ul&gt;&lt;li&gt;An item&lt;/li&gt;&lt;/ul&gt;");
    expect(html).toContain("<h2>A heading</h2>");
    expect(html).toContain("<ul><li>An item</li></ul>");
    expect(html).not.toContain("&lt;h2&gt;");
  });
});
