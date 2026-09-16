import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { env } from "@/lib/validation/env";
import { recordPlagiarismScan } from "@/modules/autoblog/repositories/automation.repository";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (env.COPYLEAKS_WEBHOOK_SECRET) {
    const provided = request.headers.get("x-copyleaks-signature") ?? "";
    const expected = crypto.createHmac("sha256", env.COPYLEAKS_WEBHOOK_SECRET).update(rawBody).digest("hex");
    const normalized = provided.replace(/^sha256=/i, "").trim();
    if (!normalized || normalized.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(normalized), Buffer.from(expected))) {
      return Response.json({ ok: false, message: "Invalid webhook signature." }, { status: 401 });
    }
  }
  const payload = JSON.parse(rawBody) as {
    scannedDocument?: { scanId?: string };
    results?: { score?: { identicalWords?: number; totalWords?: number; aggregatedScore?: number }; internet?: Array<{ url?: string }> };
    status?: string;
  };
  const scanId = payload.scannedDocument?.scanId;
  if (!scanId) return Response.json({ ok: false, message: "Missing scan id." }, { status: 400 });
  const aggregate = payload.results?.score?.aggregatedScore;
  const fallback = payload.results?.score?.totalWords ? ((payload.results.score.identicalWords ?? 0) / payload.results.score.totalWords) * 100 : undefined;
  await recordPlagiarismScan({
    provider: "Copyleaks",
    scanId,
    status: payload.status?.toLowerCase() === "completed" ? "COMPLETED" : "PROCESSING",
    similarityPercent: typeof aggregate === "number" ? aggregate : fallback,
    matchedUrls: payload.results?.internet?.map((item) => item.url ?? "").filter(Boolean),
    rawResult: payload as Record<string, unknown>,
  });
  return Response.json({ ok: true });
}
