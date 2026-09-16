import crypto from "node:crypto";
import { env } from "@/lib/validation/env";
import { postJson, providerError } from "@/modules/autoblog/providers/http";
import { healthResult, unavailableProvider } from "@/modules/autoblog/providers/unavailable";
import { recordPlagiarismScan } from "@/modules/autoblog/repositories/automation.repository";
import type { PlagiarismProvider } from "@/modules/autoblog/types/providers";

async function copyleaksToken() {
  if (!env.COPYLEAKS_EMAIL || !env.COPYLEAKS_API_KEY) throw new Error("Copyleaks email/API key are required.");
  const response = await postJson<{ access_token?: string }>(
    "https://id.copyleaks.com/v3/account/login/api",
    { email: env.COPYLEAKS_EMAIL, key: env.COPYLEAKS_API_KEY },
    {},
  );
  if (!response.access_token) throw new Error("Copyleaks token response was empty.");
  return response.access_token;
}

export const copyleaksPlagiarismProvider: PlagiarismProvider = {
  name: "Copyleaks",
  async health() {
    if (!env.COPYLEAKS_EMAIL || !env.COPYLEAKS_API_KEY) return healthResult(this.name, "CONFIGURATION_REQUIRED", "Copyleaks email/API key are required.");
    return healthResult(this.name, "HEALTHY", "Copyleaks credentials are configured.");
  },
  async check(input) {
    if (!env.COPYLEAKS_EMAIL || !env.COPYLEAKS_API_KEY) return unavailableProvider(this.name, "Copyleaks credentials are required for production plagiarism checks.");
    try {
      const token = await copyleaksToken();
      const scanId = crypto.createHash("sha256").update(`${input.url ?? ""}:${input.text}`).digest("hex").slice(0, 32);
      await postJson(
        `https://api.copyleaks.com/v3/scans/submit/file/${scanId}`,
        {
          base64: Buffer.from(input.text).toString("base64"),
          filename: `${scanId}.txt`,
          properties: { sandbox: false, webhooks: { status: "" } },
        },
        { authorization: `Bearer ${token}` },
      );
      await recordPlagiarismScan({ provider: this.name, scanId, status: "SUBMITTED" });
      return {
        ok: false,
        provider: this.name,
        state: "DEGRADED",
        message: `Copyleaks scan ${scanId} submitted. Configure webhooks/polling worker to collect final similarity before publishing.`,
        retryable: true,
      };
    } catch (error) {
      return providerError(this.name, error);
    }
  },
};
