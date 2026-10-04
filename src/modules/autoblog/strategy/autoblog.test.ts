import { describe, expect, it } from "vitest";
import { analyzeCannibalization } from "@/modules/autoblog/strategy/cannibalization";
import { classifyIntent, clusterFingerprint, normalizeKeyword } from "@/modules/autoblog/strategy/keyword";
import { scoreOpportunity } from "@/modules/autoblog/strategy/opportunity";
import { posts } from "@/lib/content/sample-data";

describe("autoblog strategy", () => {
  it("normalizes keywords safely", () => {
    expect(normalizeKeyword(" Best   Dentists in Lucknow!! ")).toBe("best dentists in lucknow");
  });

  it("groups close beginner keyword variants into a shared fingerprint", () => {
    expect(clusterFingerprint("best beginner index funds")).toBe(clusterFingerprint("top index funds for beginners"));
  });

  it("classifies deterministic commercial investigation intent", () => {
    expect(classifyIntent("best index funds for beginners").intent).toBe("COMMERCIAL_INVESTIGATION");
  });

  it("scores opportunity with weighted components", () => {
    const result = scoreOpportunity({ serpWeakness: 80, topicalRelevance: 90, rankingFeasibility: 70, searchDemand: 50, businessValue: 70, trafficPotential: 60, contentGap: 80, trend: 40, internalLinkSupport: 60 });
    expect(result.score).toBeGreaterThan(60);
    expect(result.components.serpWeakness).toBe(16);
  });

  it("prevents duplicate article creation when a keyword is already covered", () => {
    const result = analyzeCannibalization("best dentists in Lucknow", posts);
    expect(result.decision).toBe("UPDATE_EXISTING");
  });
});
