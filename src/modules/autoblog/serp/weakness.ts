import type { SerpSnapshot } from "@/modules/autoblog/types/providers";

const weakSignals = ["reddit", "quora", "forum", "community", "thin", "outdated"];

export function scoreSerpWeakness(snapshot: SerpSnapshot) {
  const reasons: string[] = [];
  let score = 0;
  const urls = snapshot.rankingUrls.slice(0, 10);
  const communityCount = urls.filter((item) => weakSignals.some((signal) => `${item.url} ${item.title ?? ""}`.toLowerCase().includes(signal))).length;
  if (communityCount >= 2) {
    score += 25;
    reasons.push("Multiple community/forum-style results are ranking.");
  }
  if (snapshot.peopleAlsoAsk.length >= 3) {
    score += 15;
    reasons.push("SERP has unanswered question demand.");
  }
  if (snapshot.features.includes("featured_snippet")) {
    score += 10;
    reasons.push("Featured snippet opportunity exists if answer format is strong.");
  }
  const titleMismatch = urls.filter((item) => item.title && !item.title.toLowerCase().includes(snapshot.keyword.toLowerCase().split(" ")[0] ?? "")).length;
  if (titleMismatch >= 4) {
    score += 20;
    reasons.push("Several ranking titles appear weakly matched to the query.");
  }
  if (urls.length < 10) {
    score += 10;
    reasons.push("Provider returned a shallow SERP set.");
  }
  return { score: Math.min(100, score), reasons };
}
