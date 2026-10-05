import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalNonEmptyString = z.preprocess(emptyToUndefined, z.string().min(1).optional());

const isObviouslyNonProductionHost = (hostname: string) => {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "0.0.0.0" || normalized === "::1" || normalized.endsWith(".local") || normalized.endsWith(".test") || normalized.endsWith(".invalid") || normalized === "example.com" || normalized.endsWith(".example.com");
};

export function validateSiteUrl(value: string | undefined, production = process.env.NODE_ENV === "production") {
  if (!value) {
    if (production) throw new Error("SITE_URL is required in production so canonical URLs and sitemaps have a real public origin.");
    return "http://localhost:3000";
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("SITE_URL must be a valid absolute URL.");
  }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("SITE_URL must use http or https and must not contain credentials, a query string, or a hash.");
  }
  if (production && (parsed.protocol !== "https:" || isObviouslyNonProductionHost(parsed.hostname))) {
    throw new Error("SITE_URL must be an HTTPS public production origin.");
  }
  return parsed.toString().replace(/\/+$/, "");
}

const envSchema = z.object({
  MONGODB_URI: optionalString,
  REDIS_URL: optionalString,
  JWT_SECRET: z.preprocess(emptyToUndefined, z.string().min(32).optional()),
  SITE_URL: optionalUrl,
  SITE_NAME: optionalNonEmptyString,
  MEDIA_PROVIDER: z.preprocess(emptyToUndefined, z.enum(["local", "r2"]).optional()),
  MEDIA_PUBLIC_URL: optionalUrl,
  MEDIA_UPLOAD_DIR: optionalString,
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET: optionalString,
  R2_PUBLIC_URL: optionalUrl,
  R2_PUBLIC_BASE_URL: optionalUrl,
  GEMINI_API_KEY: optionalString,
  GEMINI_TEXT_MODEL: optionalString,
  GEMINI_IMAGE_MODEL: optionalString,
  GOOGLE_ADS_DEVELOPER_TOKEN: optionalString,
  GOOGLE_ADS_CLIENT_ID: optionalString,
  GOOGLE_ADS_CLIENT_SECRET: optionalString,
  GOOGLE_ADS_REFRESH_TOKEN: optionalString,
  GOOGLE_ADS_CUSTOMER_ID: optionalString,
  GOOGLE_ADS_LOGIN_CUSTOMER_ID: optionalString,
  GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL: optionalString,
  GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY: optionalString,
  GOOGLE_SEARCH_CONSOLE_SITE_URL: optionalString,
  DATAFORSEO_LOGIN: optionalString,
  DATAFORSEO_PASSWORD: optionalString,
  COPYLEAKS_EMAIL: optionalString,
  COPYLEAKS_API_KEY: optionalString,
  COPYLEAKS_WEBHOOK_SECRET: optionalString,
  ZOHO_MAILBOXES_JSON: optionalString,
  ZOHO_MAIL_REGION: z.preprocess(emptyToUndefined, z.enum(["US", "EU", "IN", "AU", "JP", "CA", "CN", "AE", "SA"]).optional()),
  ZOHO_CLIENT_ID: optionalString,
  ZOHO_CLIENT_SECRET: optionalString,
  ZOHO_REFRESH_TOKEN: optionalString,
  ZOHO_ACCOUNT_ID: optionalString,
  ZOHO_MAIL_ADDRESS: z.preprocess(emptyToUndefined, z.string().email().optional()),
  ZOHO_MAIL_REFERENCE_SECRET: optionalString,
  AUTOBLOG_DRY_RUN: optionalString,
  AUTOBLOG_AUTO_PUBLISH: optionalString,
});
export const env = envSchema.parse(process.env);
export const validatedSiteUrl = validateSiteUrl(env.SITE_URL);
