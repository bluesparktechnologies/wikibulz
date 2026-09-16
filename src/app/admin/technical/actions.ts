"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { getRedis } from "@/lib/redis/client";
import { normalizePath } from "@/lib/seo/url";
import { RevalidationLogModel } from "@/models/schemas";
import { connectMongo } from "@/lib/db/mongoose";

export type TechnicalActionState = { ok: boolean; message: string };

export async function revalidateRouteAction(_state: TechnicalActionState, formData: FormData): Promise<TechnicalActionState> {
  const user = await requireRole("seo");
  const path = normalizePath(formData.get("path")?.toString() ?? "/");
  if (!path.startsWith("/") || path.startsWith("/api/")) return { ok: false, message: "Only safe internal page routes can be revalidated." };
  try {
    revalidatePath(path, "page");
    const db = await connectMongo();
    if (db) await RevalidationLogModel.create({ path, requestedBy: user.email, status: "success", message: "Manual revalidation requested." });
    return { ok: true, message: `${path} revalidated.` };
  } catch (error) {
    const db = await connectMongo();
    if (db) await RevalidationLogModel.create({ path, requestedBy: user.email, status: "failed", message: error instanceof Error ? error.message : "Unknown error" });
    return { ok: false, message: "Revalidation failed." };
  }
}

export async function invalidateCacheAction(_state: TechnicalActionState, formData: FormData): Promise<TechnicalActionState> {
  await requireRole("seo");
  const key = formData.get("key")?.toString() ?? "";
  if (!key || key.includes("*")) return { ok: false, message: "Provide one exact cache key. Wildcards are not allowed." };
  const redis = await getRedis();
  if (!redis) return { ok: false, message: "Redis is not configured." };
  await redis.del(key);
  return { ok: true, message: `Deleted cache key ${key}.` };
}

