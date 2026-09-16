import crypto from "node:crypto";
import { env } from "@/lib/validation/env";
import { okResult, postJson, providerError } from "@/modules/autoblog/providers/http";
import { healthResult, unavailableProvider } from "@/modules/autoblog/providers/unavailable";
import type { GscMetric, SearchConsoleProvider } from "@/modules/autoblog/types/providers";

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken() {
  if (!env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL || !env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY) throw new Error("Google Search Console service account credentials are required.");
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const privateKey = env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const signature = crypto.createSign("RSA-SHA256").update(`${header}.${payload}`).sign(privateKey);
  const assertion = `${header}.${payload}.${base64url(signature)}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const json = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !json.access_token) throw new Error(json.error_description ?? "Could not authenticate Google Search Console.");
  return json.access_token;
}

export const googleSearchConsoleProvider: SearchConsoleProvider = {
  name: "Google Search Console",
  async health() {
    if (!env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL || !env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY) return healthResult(this.name, "CONFIGURATION_REQUIRED", "Google Search Console service account credentials are required.");
    return healthResult(this.name, "HEALTHY", "Google Search Console credentials are configured.");
  },
  async query(input) {
    if (!env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL || !env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY) return unavailableProvider(this.name, "Google Search Console credentials are required for performance learning.");
    const started = Date.now();
    try {
      const token = await getAccessToken();
      const siteUrl = encodeURIComponent(input.siteUrl);
      const body: Record<string, unknown> = {
        startDate: input.from,
        endDate: input.to,
        dimensions: ["query", "page", "date"],
        rowLimit: 25000,
      };
      if (input.page) body.dimensionFilterGroups = [{ filters: [{ dimension: "page", operator: "equals", expression: input.page }] }];
      const response = await postJson<{ rows?: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }> }>(
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`,
        body,
        { authorization: `Bearer ${token}` },
      );
      const metrics: GscMetric[] = (response.rows ?? []).map((row) => ({
        query: row.keys[0] ?? "",
        page: row.keys[1] ?? "",
        date: row.keys[2] ?? input.to,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      }));
      return okResult(this.name, metrics, started);
    } catch (error) {
      return providerError(this.name, error);
    }
  },
};
