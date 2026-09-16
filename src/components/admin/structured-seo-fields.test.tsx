import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StructuredSeoFields } from "@/components/admin/structured-seo-fields";

describe("StructuredSeoFields", () => {
  it("renders existing structured data into both visible and submitted fields", () => {
    const html = renderToStaticMarkup(
      <StructuredSeoFields
        faqs={[{ question: "Does social media help SEO?", answer: "It supports discovery and distribution." }]}
        sources={[{ title: "SEO Starter Guide", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", publisher: "Google Search Central" }]}
        references={[{ title: "Example reference", url: "https://example.com/reference" }]}
      />,
    );

    expect(html).toContain('name="faqsRaw" value="Does social media help SEO? | It supports discovery and distribution."');
    expect(html).toContain('name="sourcesRaw" value="SEO Starter Guide | https://developers.google.com/search/docs/fundamentals/seo-starter-guide | Google Search Central | "');
    expect(html).toContain('name="referencesRaw" value="Example reference | https://example.com/reference |  | "');
    expect(html).toContain('name="faqQuestion" value="Does social media help SEO?"');
    expect(html).toContain('name="faqAnswer" value="It supports discovery and distribution."');
    expect(html).toContain('name="sourceTitle" value="SEO Starter Guide"');
    expect(html).toContain('name="sourceUrl" value="https://developers.google.com/search/docs/fundamentals/seo-starter-guide"');
    expect(html).toContain('name="referenceTitle" value="Example reference"');
    expect(html).toContain('name="referenceUrl" value="https://example.com/reference"');
  });
});
