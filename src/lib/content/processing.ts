import readingTime from "reading-time";
import { normalizeSlug } from "@/lib/seo/url";
import type { TocItem } from "@/types/content";

const tagPattern = /<[^>]*>/g;
const headingPattern = /<h([23])(?:\s[^>]*)?>(.*?)<\/h\1>/gi;

export function textFromHtml(html: string) {
  return html.replace(tagPattern, " ").replace(/\s+/g, " ").trim();
}

export function calculateWordCount(html: string) {
  const text = textFromHtml(html);
  return text ? text.split(/\s+/).length : 0;
}

export function calculateReadingMinutes(html: string) {
  return Math.max(1, Math.ceil(readingTime(textFromHtml(html)).minutes));
}

export function generateTableOfContents(html: string): TocItem[] {
  const used = new Map<string, number>();
  return Array.from(html.matchAll(headingPattern)).map((match) => {
    const base = normalizeSlug(match[2].replace(tagPattern, ""));
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return {
      id: count ? `${base}-${count + 1}` : base,
      text: match[2].replace(tagPattern, ""),
      level: match[1] === "3" ? 3 : 2,
    };
  });
}

export function ensureHeadingIds(html: string) {
  const toc = generateTableOfContents(html);
  let index = 0;
  return html.replace(headingPattern, (full, level: string, body: string) => {
    const current = toc[index++];
    if (!current || /\sid=/.test(full)) return full;
    return `<h${level} id="${current.id}">${body}</h${level}>`;
  });
}

