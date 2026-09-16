import { buildPostUrl } from "@/lib/seo/url";
import type { Post } from "@/types/content";

export type LinkSuggestion = { suggestedAnchor: string; targetUrl: string; reason: string; relevance: number; targetPostId: string };
export function suggestInternalLinks(source: Post, candidates: Post[]): LinkSuggestion[] {
  const usedAnchors = new Set<string>();
  return candidates.filter((candidate) => candidate.id !== source.id).map((candidate) => {
    const sharedTags = candidate.tags.filter((tag) => source.tags.some((sourceTag) => sourceTag.slug === tag.slug)).length;
    const sameCategory = candidate.category.slug === source.category.slug ? 35 : 0;
    const keywordOverlap = candidate.secondaryKeywords.filter((kw) => source.secondaryKeywords.includes(kw)).length * 10;
    const relevance = sameCategory + sharedTags * 15 + keywordOverlap + (candidate.focusKeyword && source.content.toLowerCase().includes(candidate.focusKeyword) ? 25 : 0);
    const suggestedAnchor = candidate.focusKeyword && !usedAnchors.has(candidate.focusKeyword) ? candidate.focusKeyword : candidate.title;
    usedAnchors.add(suggestedAnchor);
    return { suggestedAnchor, targetUrl: buildPostUrl(candidate), reason: sameCategory ? "Same category and related topical coverage" : "Keyword and tag overlap", relevance, targetPostId: candidate.id };
  }).filter((item) => item.relevance >= 25).sort((a, b) => b.relevance - a.relevance).slice(0, 8);
}
export function detectOrphanPosts(posts: Post[]) { return posts.map((post) => ({ post, inboundInternalLinks: posts.filter((candidate) => candidate.manualInternalLinks.includes(post.id) || candidate.content.includes(buildPostUrl(post))).length })).filter((item) => item.inboundInternalLinks === 0); }
