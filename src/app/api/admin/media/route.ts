import sharp from "sharp";
import { requireUser } from "@/lib/auth/guards";
import { connectMongo } from "@/lib/db/mongoose";
import { MediaAssetModel } from "@/models/schemas";
import { getStorageAdapter, validateImageUpload } from "@/services/media";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireUser();
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Missing image file." }, { status: 400 });
  const validationError = validateImageUpload({ type: file.type, size: file.size });
  if (validationError) return Response.json({ error: validationError }, { status: 400 });

  const key = `${Date.now()}-${file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9.-]/gi, "-").toLowerCase()}.webp`;
  const input = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(input, { failOn: "none" }).metadata();
  const targetWidth = metadata.width && metadata.width > 2400 ? 2400 : undefined;
  const { data, info } = await sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  const alt = formData.get("alt")?.toString().trim() || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  const stored = await getStorageAdapter().putBuffer(data, key, "image/webp");
  const asset = {
    url: stored.url,
    alt,
    size: data.length,
    fileSize: data.length,
    mimeType: "image/webp",
    provider: stored.provider,
    width: info.width,
    height: info.height,
    usageReferences: [],
  };
  const db = await connectMongo();
  if (db) await MediaAssetModel.updateOne({ url: asset.url }, asset, { upsert: true });
  return Response.json(asset);
}
