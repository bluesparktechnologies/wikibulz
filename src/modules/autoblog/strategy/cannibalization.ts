import { buildPostUrl } from "@/lib/seo/url";
import { clusterFingerprint, normalizeKeyword } from "@/modules/autoblog/strategy/keyword";
import type { Post } from "@/types/content";

export type CannibalizationDecision = "CREATE_NEW" | "UPDATE_EXISTING" | "EXPAND_EXISTING" | "MERGE" | "DIFFERENTIATE" | "SKIP";

export function analyzeCannibalization(keyword: string, posts: Post[]): { decision: CannibalizationDecision; matchedPostId?: string; reason: string; url?: string } {
  const normalized = normalizeKeyword(keyword);
  const fingerprint = clusterFingerprint(keyword);
  const exact = posts.find((post) => [post.title, post.focusKeyword, ...post.secondaryKeywords].filter((item): item is string => Boolean(item)).map(normalizeKeyword).includes(normalized));
  if (exact) return { decision: "UPDATE_EXISTING", matchedPostId: exact.id, url: buildPostUrl(exact), reason: "Existing post already targets this query or a very close equivalent." };
  const clusterMatch = posts.find((post) => clusterFingerprint([post.title, post.focusKeyword, ...post.secondaryKeywords].filter(Boolean).join(" ")) === fingerprint);
  if (clusterMatch) return { decision: "EXPAND_EXISTING", matchedPostId: clusterMatch.id, url: buildPostUrl(clusterMatch), reason: "Existing page appears to cover the same parent intent cluster." };
  const titleOverlap = posts.find((post) => normalized.split(" ").filter((word) => word.length > 3).filter((word) => normalizeKeyword(post.title).includes(word)).length >= 3);
  if (titleOverlap) return { decision: "DIFFERENTIATE", matchedPostId: titleOverlap.id, url: buildPostUrl(titleOverlap), reason: "Existing title has meaningful topical overlap; differentiation is required before creating a new URL." };
  return { decision: "CREATE_NEW", reason: "No strong overlap found in current content inventory." };
}
