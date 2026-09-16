import type { ContentAssetType, KeywordIntent, ProviderHealthState } from "@/modules/autoblog/types/automation";

export type ProviderResult<T> =
  | { ok: true; data: T; provider: string; costUsd?: number; latencyMs?: number }
  | { ok: false; provider: string; state: ProviderHealthState; message: string; retryable: boolean };

export type KeywordMetric = {
  keyword: string;
  normalizedKeyword: string;
  country: string;
  language: string;
  searchVolume?: number;
  adsCompetition?: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  cpc?: number;
  trend?: number[];
};

export type SerpSnapshot = {
  keyword: string;
  country: string;
  language: string;
  rankingUrls: Array<{ url: string; title?: string; description?: string; domain?: string }>;
  features: string[];
  peopleAlsoAsk: string[];
  relatedSearches: string[];
  capturedAt: string;
};

export type PlagiarismReport = {
  similarityPercent: number;
  matchedUrls: string[];
  passed: boolean;
};

export type GscMetric = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
};

export type NewsTopic = {
  title: string;
  url: string;
  publisher?: string;
  publishedAt?: string;
  snippet?: string;
  source: "google-news-rss" | "hacker-news" | "gdelt" | "keyword-only";
  score: number;
};

export interface KeywordDataProvider {
  name: string;
  health(): Promise<ProviderResult<{ state: ProviderHealthState }>>;
  discover(input: { seeds: string[]; country: string; language: string; url?: string }): Promise<ProviderResult<KeywordMetric[]>>;
}

export interface NewsDiscoveryProvider {
  name: string;
  health(): Promise<ProviderResult<{ state: ProviderHealthState }>>;
  discover(input: { topics: string[]; country: string; language: string; limit?: number }): Promise<ProviderResult<NewsTopic[]>>;
}

export interface SerpProvider {
  name: string;
  health(): Promise<ProviderResult<{ state: ProviderHealthState }>>;
  snapshot(input: { keyword: string; country: string; language: string }): Promise<ProviderResult<SerpSnapshot>>;
}

export interface PlagiarismProvider {
  name: string;
  health(): Promise<ProviderResult<{ state: ProviderHealthState }>>;
  check(input: { text: string; url?: string }): Promise<ProviderResult<PlagiarismReport>>;
}

export interface SearchConsoleProvider {
  name: string;
  health(): Promise<ProviderResult<{ state: ProviderHealthState }>>;
  query(input: { siteUrl: string; from: string; to: string; page?: string }): Promise<ProviderResult<GscMetric[]>>;
}

export interface ImageProvider {
  name: string;
  health(): Promise<ProviderResult<{ state: ProviderHealthState }>>;
  generateFeaturedImage(input: { title: string; brief: string; style?: string }): Promise<ProviderResult<{ url: string; alt: string }>>;
  generateSupportingVisual(input: { section: string; brief: string }): Promise<ProviderResult<{ url: string; alt: string }>>;
  generateDiagram(input: { concept: string; brief: string }): Promise<ProviderResult<{ url: string; alt: string }>>;
  regenerateImage(input: { imageId: string; instructions: string }): Promise<ProviderResult<{ url: string; alt: string }>>;
}

export type IntentResult = {
  intent: KeywordIntent;
  assetType: ContentAssetType;
  confidence: number;
  reason: string;
};
