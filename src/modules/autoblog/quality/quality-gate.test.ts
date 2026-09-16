import { describe, expect, it } from "vitest";
import { posts } from "@/lib/content/sample-data";
import { defaultAutomationSettings } from "@/modules/autoblog/repositories/automation.repository";
import { runFinalQualityGate } from "@/modules/autoblog/quality/quality-gate";

describe("autoblog quality gate", () => {
  it("blocks auto-publishing when mandatory safety signals are missing", () => {
    const result = runFinalQualityGate(posts[0], { ...defaultAutomationSettings, publishingMode: "DIRECT_PUBLISH", plagiarismMode: "API_REQUIRED", autoPublish: true }, {});

    expect(result.passed).toBe(false);
    expect(result.blockers).toContain("Plagiarism API is required and has not passed.");
    expect(result.blockers).toContain("Fact verification is required and has not passed.");
  });

  it("allows review-mode publishing flow with LLM risk only when risk is not high", () => {
    const result = runFinalQualityGate(posts[0], { ...defaultAutomationSettings, publishingMode: "SAVE_FOR_REVIEW", plagiarismMode: "LLM_RISK_ONLY" }, {
      llmPlagiarismRisk: "LOW",
      factCheckPassed: true,
      informationGain: "HIGH",
    });

    expect(result.passed).toBe(true);
  });

  it("allows an article when SEO and mandatory safety signals pass", () => {
    const result = runFinalQualityGate(posts[0], defaultAutomationSettings, {
      plagiarismScore: 2,
      factCheckPassed: true,
      informationGain: "HIGH",
    });

    expect(result.passed).toBe(true);
    expect(result.blockers).toEqual([]);
  });
});
