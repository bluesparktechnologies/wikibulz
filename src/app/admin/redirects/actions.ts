"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { connectMongo } from "@/lib/db/mongoose";
import { redirectFormSchema } from "@/lib/validation/content";
import { RedirectModel } from "@/models/schemas";
import { getRedirects } from "@/repositories/content.repository";
import { validateRedirect } from "@/services/redirects";

export type RedirectActionState = { ok: boolean; message: string };

const value = (formData: FormData, key: string) => formData.get(key)?.toString() ?? "";

export async function saveRedirectAction(_state: RedirectActionState, formData: FormData): Promise<RedirectActionState> {
  await requireRole("seo");
  const db = await connectMongo();
  if (!db) return { ok: false, message: "MongoDB is not configured. Add MONGODB_URI before saving redirects." };
  const parsed = redirectFormSchema.parse({
    sourcePath: value(formData, "sourcePath"),
    destinationPath: value(formData, "destinationPath"),
    statusCode: value(formData, "statusCode") || "301",
    active: formData.has("active"),
  });
  const warnings = validateRedirect({ id: "new", createdAt: new Date().toISOString(), ...parsed }, await getRedirects());
  if (warnings.some((warning) => warning.includes("loop") || warning.includes("itself"))) {
    return { ok: false, message: warnings.join(", ") };
  }
  await RedirectModel.updateOne({ sourcePath: parsed.sourcePath }, parsed, { upsert: true, runValidators: true });
  revalidatePath("/admin/redirects");
  return { ok: true, message: warnings.length ? `Saved with warning: ${warnings.join(", ")}` : "Redirect saved." };
}
