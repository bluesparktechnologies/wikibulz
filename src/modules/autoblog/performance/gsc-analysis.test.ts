import { describe, expect, it } from "vitest";
import { detectContentDecay, findCtrOpportunities, findStrikingDistance } from "@/modules/autoblog/performance/gsc-analysis";
import type { GscMetric } from "@/modules/autoblog/types/providers";

const metric = (overrides: Partial<GscMetric>): GscMetric => ({
  query: "index funds",
  page: "https://example.com/investing/index-funds",
  clicks: 10,
  impressions: 1000,
  ctr: 0.01,
  position: 8,
  date: "2026-08-31",
  ...overrides,
});

describe("GSC analysis", () => {
  it("finds striking-distance queries", () => {
    expect(findStrikingDistance([metric({ position: 12 })])).toHaveLength(1);
  });

  it("finds weak CTR opportunities without auto-changing titles", () => {
    expect(findCtrOpportunities([metric({ position: 3, ctr: 0.01 })])[0]?.recommendation).toContain("Test title/meta");
  });

  it("detects content decay from falling clicks", () => {
    expect(detectContentDecay(metric({ clicks: 100 }), metric({ clicks: 60 })).decayed).toBe(true);
  });
});
