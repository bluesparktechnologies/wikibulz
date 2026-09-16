import type { GscMetric } from "@/modules/autoblog/types/providers";

export function findStrikingDistance(metrics: GscMetric[], from = 4, to = 20) {
  return metrics
    .filter((metric) => metric.position >= from && metric.position <= to && metric.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions)
    .map((metric) => ({ ...metric, recommendation: "Improve section coverage, title/snippet match, evidence, and internal links before creating a new URL." }));
}

export function findCtrOpportunities(metrics: GscMetric[]) {
  return metrics
    .filter((metric) => metric.impressions >= 100 && metric.position <= 10 && metric.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions)
    .map((metric) => ({ ...metric, recommendation: "Test title/meta alignment carefully and track outcome as an SEO experiment." }));
}

export function detectContentDecay(previous: GscMetric, current: GscMetric) {
  const clickDrop = previous.clicks > 0 ? (previous.clicks - current.clicks) / previous.clicks : 0;
  const impressionDrop = previous.impressions > 0 ? (previous.impressions - current.impressions) / previous.impressions : 0;
  const positionDrop = current.position - previous.position;
  return {
    decayed: clickDrop >= 0.25 || impressionDrop >= 0.25 || positionDrop >= 3,
    signals: { clickDrop, impressionDrop, positionDrop },
  };
}
