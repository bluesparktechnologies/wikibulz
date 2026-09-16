import { env } from "@/lib/validation/env";
import { basicAuth, okResult, postJson, providerError } from "@/modules/autoblog/providers/http";
import { healthResult, unavailableProvider } from "@/modules/autoblog/providers/unavailable";
import type { SerpProvider, SerpSnapshot } from "@/modules/autoblog/types/providers";

type DataForSeoTask = {
  result?: Array<{
    items?: Array<{ type?: string; url?: string; title?: string; description?: string; domain?: string; title_highlighted?: string[] }>;
    related_searches?: string[];
  }>;
};

export const dataForSeoSerpProvider: SerpProvider = {
  name: "DataForSEO",
  async health() {
    if (!env.DATAFORSEO_LOGIN || !env.DATAFORSEO_PASSWORD) return healthResult(this.name, "CONFIGURATION_REQUIRED", "DataForSEO login/password are required.");
    return healthResult(this.name, "HEALTHY", "DataForSEO credentials are configured.");
  },
  async snapshot(input) {
    if (!env.DATAFORSEO_LOGIN || !env.DATAFORSEO_PASSWORD) return unavailableProvider(this.name, "DataForSEO credentials are required for live SERP snapshots.");
    const started = Date.now();
    try {
      const response = await postJson<{ tasks?: DataForSeoTask[] }>(
        "https://api.dataforseo.com/v3/serp/google/organic/live/advanced",
        [{ keyword: input.keyword, location_code: input.country === "US" ? 2840 : undefined, language_code: input.language, depth: 20 }],
        { authorization: basicAuth(env.DATAFORSEO_LOGIN, env.DATAFORSEO_PASSWORD) },
      );
      const task = response.tasks?.[0];
      const items = task?.result?.[0]?.items ?? [];
      const rankingUrls = items.filter((item) => item.url).map((item) => ({
        url: item.url ?? "",
        title: item.title,
        description: item.description,
        domain: item.domain,
      }));
      const features = Array.from(new Set(items.map((item) => item.type).filter(Boolean))) as string[];
      const peopleAlsoAsk = items.filter((item) => item.type === "people_also_ask").flatMap((item) => item.title_highlighted ?? []);
      const data: SerpSnapshot = {
        keyword: input.keyword,
        country: input.country,
        language: input.language,
        rankingUrls,
        features,
        peopleAlsoAsk,
        relatedSearches: task?.result?.[0]?.related_searches ?? [],
        capturedAt: new Date().toISOString(),
      };
      return okResult(this.name, data, started, 0.002);
    } catch (error) {
      return providerError(this.name, error);
    }
  },
};
