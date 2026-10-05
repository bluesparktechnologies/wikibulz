import { requireUser } from "@/lib/auth/guards";
import { connectMongo } from "@/lib/db/mongoose";
import { createMediaAsset } from "@/services/media";

export const runtime = "nodejs";

function wantsHtml(request: Request) {
  return request.headers.get("accept")?.includes("text/html") || request.headers.get("sec-fetch-mode") === "navigate";
}

function redirectToMedia(request: Request, params: Record<string, string>) {
  const url = new URL("/admin/media", request.url);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return Response.redirect(url, 303);
}

export async function POST(request: Request) {
  await requireUser();
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    if (wantsHtml(request)) return redirectToMedia(request, { error: "Missing image file." });
    return Response.json({ error: "Missing image file." }, { status: 400 });
  }

  try {
    const db = await connectMongo();
    if (!db) throw new Error("MongoDB is not configured. Add MONGODB_URI before uploading media.");
    const asset = await createMediaAsset({
      file,
      alt: formData.get("alt")?.toString(),
      prefix: "media",
    });
    if (wantsHtml(request)) return redirectToMedia(request, { message: "Image uploaded.", url: asset.url });
    return Response.json(asset);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed.";
    if (wantsHtml(request)) return redirectToMedia(request, { error: message });
    return Response.json({ error: message }, { status: 400 });
  }
}
