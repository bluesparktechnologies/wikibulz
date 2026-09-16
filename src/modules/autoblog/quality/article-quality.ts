import type { Post } from "@/types/content";

const internalPlanningPhrases = [
  "search and discovery angle",
  "reader questions this article should answer",
  "suggested follow-up coverage",
  "the target topic is",
  "the target keyword is",
  "the article should",
  "this article should",
  "source-aware research package",
  "editor review required",
  "needs_review",
];

const weakTitlePatterns = [
  /practical context for readers/i,
  /what it means for technology readers/i,
  /update ideas for/i,
];

function plainText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function countOccurrences(text: string, phrase: string) {
  if (!phrase.trim()) return 0;
  return text.toLowerCase().split(phrase.toLowerCase()).length - 1;
}

export function findArticlePublicationBlockers(post: Pick<Post, "title" | "content" | "focusKeyword" | "secondaryKeywords">) {
  const text = plainText(post.content).toLowerCase();
  const title = post.title.trim();
  const blockers = [
    ...internalPlanningPhrases
      .filter((phrase) => text.includes(phrase) || title.toLowerCase().includes(phrase))
      .map((phrase) => `Internal planning phrase leaked into article: "${phrase}".`),
    ...weakTitlePatterns
      .filter((pattern) => pattern.test(title))
      .map(() => "Title uses a generic automation template."),
    title.length > 90 ? "Title is too long for a clean editorial headline." : "",
    post.focusKeyword && post.focusKeyword.length > 80 ? "Focus keyword looks like a full headline instead of a search topic." : "",
    post.focusKeyword && countOccurrences(plainText(post.content), post.focusKeyword) > 3 ? "Focus keyword is repeated too many times." : "",
  ].filter(Boolean);
  return Array.from(new Set(blockers));
}
