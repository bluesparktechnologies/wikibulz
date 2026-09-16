import { env } from "@/lib/validation/env";
import { okResult, postJson, providerError } from "@/modules/autoblog/providers/http";
import { healthResult, unavailableProvider } from "@/modules/autoblog/providers/unavailable";
import { normalizeKeyword } from "@/modules/autoblog/strategy/keyword";
import type { KeywordDataProvider, KeywordMetric } from "@/modules/autoblog/types/providers";

async function googleAdsAccessToken() {
  if (!env.GOOGLE_ADS_CLIENT_ID || !env.GOOGLE_ADS_CLIENT_SECRET || !env.GOOGLE_ADS_REFRESH_TOKEN) throw new Error("Google Ads OAuth credentials are required.");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_ADS_CLIENT_ID,
      client_secret: env.GOOGLE_ADS_CLIENT_SECRET,
      refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const json = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !json.access_token) throw new Error(json.error_description ?? "Could not authenticate Google Ads.");
  return json.access_token;
}

export const googleAdsKeywordProvider: KeywordDataProvider = {
  name: "Google Ads Keyword Planner",
  async health() {
    const required = [env.GOOGLE_ADS_DEVELOPER_TOKEN, env.GOOGLE_ADS_CLIENT_ID, env.GOOGLE_ADS_CLIENT_SECRET, env.GOOGLE_ADS_REFRESH_TOKEN, env.GOOGLE_ADS_CUSTOMER_ID];
    if (required.some((value) => !value)) return healthResult(this.name, "CONFIGURATION_REQUIRED", "Google Ads developer token, OAuth credentials, refresh token, and customer id are required.");
    return healthResult(this.name, "HEALTHY", "Google Ads credentials are configured.");
  },
  async discover(input) {
    const required = [env.GOOGLE_ADS_DEVELOPER_TOKEN, env.GOOGLE_ADS_CLIENT_ID, env.GOOGLE_ADS_CLIENT_SECRET, env.GOOGLE_ADS_REFRESH_TOKEN, env.GOOGLE_ADS_CUSTOMER_ID];
    if (required.some((value) => !value)) return unavailableProvider(this.name, "Google Ads credentials are required for production keyword metrics.");
    const started = Date.now();
    try {
      const token = await googleAdsAccessToken();
      const url = `https://googleads.googleapis.com/v25/customers/${env.GOOGLE_ADS_CUSTOMER_ID}:generateKeywordIdeas`;
      const headers: Record<string, string> = {
        authorization: `Bearer ${token}`,
        "developer-token": env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "",
      };
      if (env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) headers["login-customer-id"] = env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
      const response = await postJson<{ results?: Array<{ text?: string; keywordIdeaMetrics?: { avgMonthlySearches?: string; competition?: string; averageCpcMicros?: string; monthlySearchVolumes?: Array<{ monthlySearches?: string }> } }> }>(
        url,
        {
          language: `languageConstants/${input.language === "en" ? "1000" : input.language}`,
          geoTargetConstants: input.country === "US" ? ["geoTargetConstants/2840"] : undefined,
          keywordSeed: { keywords: input.seeds },
          keywordPlanNetwork: "GOOGLE_SEARCH",
        },
        headers,
      );
      const data: KeywordMetric[] = (response.results ?? []).map((item) => ({
        keyword: item.text ?? "",
        normalizedKeyword: normalizeKeyword(item.text ?? ""),
        country: input.country,
        language: input.language,
        searchVolume: Number(item.keywordIdeaMetrics?.avgMonthlySearches ?? 0),
        adsCompetition: ["LOW", "MEDIUM", "HIGH"].includes(item.keywordIdeaMetrics?.competition ?? "") ? item.keywordIdeaMetrics?.competition as KeywordMetric["adsCompetition"] : "UNKNOWN",
        cpc: Number(item.keywordIdeaMetrics?.averageCpcMicros ?? 0) / 1_000_000,
        trend: item.keywordIdeaMetrics?.monthlySearchVolumes?.map((volume) => Number(volume.monthlySearches ?? 0)),
      })).filter((item) => item.keyword);
      return okResult(this.name, data, started, 0.001);
    } catch (error) {
      return providerError(this.name, error);
    }
  },
};
