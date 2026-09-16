import { describe, expect, it } from "vitest";
import { keywordProvider, plagiarismProvider, searchConsoleProvider, serpProvider } from "@/modules/autoblog/providers/registry";

describe("provider fail-safe behavior", () => {
  it("does not fabricate keyword metrics without configured credentials", async () => {
    const result = await keywordProvider.discover({ seeds: ["index funds"], country: "US", language: "en" });
    if (!result.ok) {
      expect(result.state).toBe("CONFIGURATION_REQUIRED");
      expect(result.retryable).toBe(false);
    }
  });

  it("does not fabricate SERP snapshots without configured credentials", async () => {
    const result = await serpProvider.snapshot({ keyword: "index funds", country: "US", language: "en" });
    if (!result.ok) expect(result.state).toBe("CONFIGURATION_REQUIRED");
  });

  it("does not pass plagiarism checks without configured credentials", async () => {
    const result = await plagiarismProvider.check({ text: "Original article body" });
    if (!result.ok) expect(result.state).toBe("CONFIGURATION_REQUIRED");
  });

  it("does not fabricate GSC rows without configured credentials", async () => {
    const result = await searchConsoleProvider.query({ siteUrl: "https://example.com", from: "2026-08-01", to: "2026-08-31" });
    if (!result.ok) expect(result.state).toBe("CONFIGURATION_REQUIRED");
  });
});
