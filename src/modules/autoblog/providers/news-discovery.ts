import { okResult, providerError } from "@/modules/autoblog/providers/http";
import { healthResult } from "@/modules/autoblog/providers/unavailable";
import type { NewsDiscoveryProvider, NewsTopic } from "@/modules/autoblog/types/providers";

function stripXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(item: string, name: string) {
  const match = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? stripXml(match[1] ?? "") : undefined;
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function freshnessScore(publishedAt?: string) {
  if (!publishedAt) return 35;
  const ageHours = Math.max(0, (Date.now() - Date.parse(publishedAt)) / 36e5);
  if (ageHours <= 6) return 100;
  if (ageHours <= 24) return 85;
  if (ageHours <= 72) return 65;
  if (ageHours <= 168) return 45;
  return 25;
}

function dedupe(topics: NewsTopic[]) {
  const seen = new Set<string>();
  return topics
    .filter((topic) => {
      const key = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 120);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score);
}

async function googleNews(topics: string[], country: string, language: string, limit: number) {
  const output: NewsTopic[] = [];
  const hl = `${language}-${country === "IN" ? "IN" : "US"}`;
  const gl = country === "IN" ? "IN" : "US";
  for (const topic of topics.slice(0, 8)) {
    const query = encodeURIComponent(`${topic} local services OR clinics OR institutes OR agencies`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=${hl}&gl=${gl}&ceid=${gl}:${language}`;
    const response = await fetch(url, { headers: { "user-agent": "WikibulzAutomation/1.0" } });
    if (!response.ok) continue;
    const xml = await response.text();
    for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
      const item = match[1] ?? "";
      const title = tag(item, "title");
      const link = tag(item, "link");
      if (!title || !link) continue;
      const publishedAt = tag(item, "pubDate");
      const source = tag(item, "source") ?? hostname(link);
      output.push({
        title,
        url: link,
        publisher: source,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        snippet: tag(item, "description"),
        source: "google-news-rss",
        score: freshnessScore(publishedAt) + 15,
      });
      if (output.length >= limit) return output;
    }
  }
  return output;
}

async function gdelt(topics: string[], limit: number) {
  const query = encodeURIComponent(`(${topics.slice(0, 6).join(" OR ")}) local services clinics institutes agencies`);
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&format=json&maxrecords=${limit}&sort=HybridRel`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const json = await response.json() as { articles?: Array<{ title?: string; url?: string; sourceCommonName?: string; seendate?: string }> };
  return (json.articles ?? []).filter((article) => article.title && article.url).map((article): NewsTopic => ({
    title: article.title ?? "",
    url: article.url ?? "",
    publisher: article.sourceCommonName ?? hostname(article.url ?? ""),
    publishedAt: article.seendate ? new Date(article.seendate).toISOString() : undefined,
    source: "gdelt" as const,
    score: freshnessScore(article.seendate) + 5,
  }));
}

export const newsDiscoveryProvider: NewsDiscoveryProvider = {
  name: "News Discovery",
  async health() {
    return healthResult(this.name, "HEALTHY", "Free discovery sources configured: Google News RSS and GDELT.");
  },
  async discover(input) {
    const started = Date.now();
    try {
      const topics = input.topics.length ? input.topics : ["local rankings", "healthcare", "education", "business services"];
      const limit = input.limit ?? 30;
      const [rss, gdeltItems] = await Promise.all([
        googleNews(topics, input.country, input.language, limit),
        gdelt(topics, limit),
      ]);
      return okResult(this.name, dedupe([...rss, ...gdeltItems]).slice(0, limit), started, 0);
    } catch (error) {
      return providerError(this.name, error);
    }
  },
};
