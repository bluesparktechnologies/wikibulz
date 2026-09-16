import { env } from "@/lib/validation/env";
import { copyleaksPlagiarismProvider } from "@/modules/autoblog/providers/copyleaks";
import { dataForSeoSerpProvider } from "@/modules/autoblog/providers/dataforseo";
import { googleAdsKeywordProvider } from "@/modules/autoblog/providers/google-ads";
import { newsDiscoveryProvider } from "@/modules/autoblog/providers/news-discovery";
import { googleSearchConsoleProvider } from "@/modules/autoblog/providers/google-search-console";
import { nanoBananaImageProvider } from "@/modules/autoblog/providers/nano-banana";
import { healthResult } from "@/modules/autoblog/providers/unavailable";
import type { ProviderResult } from "@/modules/autoblog/types/providers";
import type { ProviderHealthState } from "@/modules/autoblog/types/automation";

const mongoProvider = {
  name: "MongoDB",
  async health(): Promise<ProviderResult<{ state: ProviderHealthState }>> {
    return healthResult(this.name, env.MONGODB_URI ? "HEALTHY" : "CONFIGURATION_REQUIRED", env.MONGODB_URI ? "MongoDB URI configured." : "MONGODB_URI is required for durable automation.");
  },
};

const redisProvider = {
  name: "Redis",
  async health(): Promise<ProviderResult<{ state: ProviderHealthState }>> {
    return healthResult(this.name, env.REDIS_URL ? "HEALTHY" : "CONFIGURATION_REQUIRED", env.REDIS_URL ? "Redis URL configured." : "REDIS_URL is required for automation queues.");
  },
};

const geminiTextProvider = {
  name: "Gemini Text",
  async health(): Promise<ProviderResult<{ state: ProviderHealthState }>> {
    return healthResult(this.name, env.GEMINI_API_KEY ? "HEALTHY" : "CONFIGURATION_REQUIRED", env.GEMINI_API_KEY ? "Gemini text API key configured." : "GEMINI_API_KEY is required for AI tasks.");
  },
};

export const keywordProvider = googleAdsKeywordProvider;
export const newsProvider = newsDiscoveryProvider;
export const serpProvider = dataForSeoSerpProvider;
export const plagiarismProvider = copyleaksPlagiarismProvider;
export const searchConsoleProvider = googleSearchConsoleProvider;
export const imageProvider = nanoBananaImageProvider;
export const providerRegistry = [mongoProvider, redisProvider, geminiTextProvider, newsProvider, keywordProvider, serpProvider, plagiarismProvider, searchConsoleProvider, imageProvider];
