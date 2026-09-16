import { describe, expect, it } from "vitest";
import { structuredFieldNames, structuredRawValues } from "@/lib/admin/structured-fields";

describe("structuredRawValues", () => {
  it("serializes visible structured fields when hidden synchronization is stale", () => {
    const formData = new FormData();
    formData.set("faqsRaw", "");
    formData.set("sourcesRaw", "");
    formData.set("referencesRaw", "");
    formData.append(structuredFieldNames.faqQuestion, "Does social media help SEO?");
    formData.append(structuredFieldNames.faqAnswer, "It helps content discovery and distribution.");
    formData.append(structuredFieldNames.sourceTitle, "SEO Starter Guide");
    formData.append(structuredFieldNames.sourceUrl, "https://developers.google.com/search/docs/fundamentals/seo-starter-guide");
    formData.append(structuredFieldNames.sourcePublisher, "Google Search Central");
    formData.append(structuredFieldNames.sourceDateAccessed, "2026-09-12");

    expect(structuredRawValues(formData)).toEqual({
      faqsRaw: "Does social media help SEO? | It helps content discovery and distribution.",
      sourcesRaw: "SEO Starter Guide | https://developers.google.com/search/docs/fundamentals/seo-starter-guide | Google Search Central | 2026-09-12",
      referencesRaw: "",
    });
  });

  it("keeps row ordering and empty optional cells aligned", () => {
    const formData = new FormData();
    formData.append(structuredFieldNames.referenceTitle, "First reference");
    formData.append(structuredFieldNames.referenceTitle, "Second reference");
    formData.append(structuredFieldNames.referenceUrl, "https://example.com/first");
    formData.append(structuredFieldNames.referenceUrl, "https://example.com/second");
    formData.append(structuredFieldNames.referencePublisher, "");
    formData.append(structuredFieldNames.referencePublisher, "Second publisher");
    formData.append(structuredFieldNames.referenceDateAccessed, "");
    formData.append(structuredFieldNames.referenceDateAccessed, "2026-09-12");

    expect(structuredRawValues(formData).referencesRaw).toBe(
      "First reference | https://example.com/first |  | \nSecond reference | https://example.com/second | Second publisher | 2026-09-12",
    );
  });

  it("falls back to legacy hidden values for previously saved local drafts", () => {
    const formData = new FormData();
    formData.set("faqsRaw", "Legacy question? | Legacy answer remains available.");
    formData.set("sourcesRaw", "Legacy source | https://example.com/source | Example | ");
    formData.set("referencesRaw", "Legacy reference | https://example.com/reference | Example | ");
    formData.append(structuredFieldNames.faqQuestion, "");
    formData.append(structuredFieldNames.faqAnswer, "");
    formData.append(structuredFieldNames.sourceTitle, "");
    formData.append(structuredFieldNames.sourceUrl, "");
    formData.append(structuredFieldNames.referenceTitle, "");
    formData.append(structuredFieldNames.referenceUrl, "");

    expect(structuredRawValues(formData)).toEqual({
      faqsRaw: "Legacy question? | Legacy answer remains available.",
      sourcesRaw: "Legacy source | https://example.com/source | Example | ",
      referencesRaw: "Legacy reference | https://example.com/reference | Example | ",
    });
  });
});
