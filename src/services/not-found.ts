import { connectMongo } from "@/lib/db/mongoose";
import { normalizePath } from "@/lib/seo/url";
import { NotFoundModel } from "@/models/schemas";

const garbagePatterns = [/wp-admin/i, /phpmyadmin/i, /\.env/i, /xmlrpc\.php/i, /\/vendor\//i, /\/cgi-bin\//i, /\.(php|asp|aspx)$/i];

export type NotFoundReportItem = {
  url: string;
  hitCount: number;
  firstSeen: string;
  lastSeen: string;
  referrer?: string;
};

type NotFoundDoc = {
  url?: unknown;
  hitCount?: unknown;
  firstSeen?: unknown;
  lastSeen?: unknown;
  referrer?: unknown;
};

export function shouldTrackNotFound(path: string) {
  return !garbagePatterns.some((pattern) => pattern.test(path));
}

export async function trackNotFound(path: string, referrer?: string) {
  const normalized = normalizePath(path);
  if (!shouldTrackNotFound(normalized)) return;
  const db = await connectMongo();
  if (!db) return;
  const now = new Date();
  await NotFoundModel.updateOne(
    { url: normalized },
    {
      $setOnInsert: { url: normalized, firstSeen: now },
      $set: { lastSeen: now, referrer },
      $inc: { hitCount: 1 },
    },
    { upsert: true },
  );
}

export async function getNotFoundReport(limit = 50): Promise<NotFoundReportItem[]> {
  const db = await connectMongo();
  if (!db) return [];
  const docs = await NotFoundModel.find({}).sort({ hitCount: -1, lastSeen: -1 }).limit(limit).lean<NotFoundDoc[]>();
  return docs.map((doc) => ({
    url: typeof doc.url === "string" ? doc.url : "",
    hitCount: typeof doc.hitCount === "number" ? doc.hitCount : 0,
    firstSeen: doc.firstSeen instanceof Date ? doc.firstSeen.toISOString() : typeof doc.firstSeen === "string" ? doc.firstSeen : "",
    lastSeen: doc.lastSeen instanceof Date ? doc.lastSeen.toISOString() : typeof doc.lastSeen === "string" ? doc.lastSeen : "",
    referrer: typeof doc.referrer === "string" ? doc.referrer : undefined,
  }));
}

