import type { KeywordIntent } from "@/modules/autoblog/types/automation";

export function normalizeKeyword(keyword: string) {
  return keyword.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
}

export function classifyIntent(keyword: string): { intent: KeywordIntent; confidence: number; reason: string } {
  const value = normalizeKeyword(keyword);
  if (/\b(best|top|review|vs|compare|comparison)\b/.test(value)) return { intent: "COMMERCIAL_INVESTIGATION", confidence: 0.72, reason: "Comparison or evaluation modifier detected." };
  if (/\b(buy|price|coupon|near me|book)\b/.test(value)) return { intent: "TRANSACTIONAL", confidence: 0.7, reason: "Transactional modifier detected." };
  if (/\b(login|official|website)\b/.test(value)) return { intent: "NAVIGATIONAL", confidence: 0.7, reason: "Navigational modifier detected." };
  if (/\b(how|what|why|guide|learn|meaning|definition)\b/.test(value)) return { intent: "INFORMATIONAL", confidence: 0.75, reason: "Learning/question modifier detected." };
  return { intent: "UNKNOWN", confidence: 0.35, reason: "No strong deterministic modifier found; provider or Gemini classification required." };
}

export function clusterFingerprint(keyword: string) {
  return normalizeKeyword(keyword)
    .replace(/\b(best|top|guide|how to|for beginners|beginner|review|reviews|compare|comparison)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
