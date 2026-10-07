import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { connectMongo } from "@/lib/db/mongoose";
import { env } from "@/lib/validation/env";
import { MediaAssetModel } from "@/models/schemas";

export type StoredMedia = {
  url: string;
  provider: "local" | "mongo" | "r2";
};

export type StoredMediaAsset = {
  url: string;
  alt: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  provider: "local" | "mongo" | "r2";
  usageReferences: string[];
};

export type StorageAdapter = {
  putBuffer(buffer: Buffer, key: string, contentType: string): Promise<StoredMedia>;
  delete(key: string): Promise<void>;
};

export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function validateImageUpload(file: { type: string; size: number }) {
  if (!allowedImageTypes.includes(file.type)) return "Unsupported image type";
  if (file.size > 10 * 1024 * 1024) return "Images must be smaller than 10MB before optimization";
  return null;
}

export function uploadRoot() {
  return path.resolve(env.MEDIA_UPLOAD_DIR?.trim() || path.join(process.cwd(), ".data", "uploads"));
}

export function localUploadPath(key: string) {
  const safeKey = key.replace(/^\/+/, "").replace(/\\/g, "/");
  const root = uploadRoot();
  const resolved = path.resolve(root, safeKey);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Invalid upload path.");
  return resolved;
}

export async function readLocalUpload(key: string) {
  try {
    return await readFile(localUploadPath(key));
  } catch (error) {
    const db = await connectMongo();
    if (!db) throw error;
    const localUrl = `/uploads/${key}`;
    const publicUrl = publicLocalUrl(key);
    const doc = await MediaAssetModel.findOne({ url: { $in: Array.from(new Set([localUrl, publicUrl])) } }).select("data").lean<{ data?: Buffer }>();
    if (doc?.data) return Buffer.from(doc.data);
    throw error;
  }
}

export function keyFromLocalUploadUrl(url: string) {
  if (!url.startsWith("/uploads/")) return null;
  const key = decodeURIComponent(url.slice("/uploads/".length));
  return key && !key.startsWith("/") ? key : null;
}

export async function localUploadExists(key: string) {
  try {
    await access(localUploadPath(key));
    return true;
  } catch {
    const db = await connectMongo();
    if (!db) return false;
    const localUrl = `/uploads/${key}`;
    const publicUrl = publicLocalUrl(key);
    const count = await MediaAssetModel.countDocuments({
      url: { $in: Array.from(new Set([localUrl, publicUrl])) },
      data: { $exists: true, $ne: null },
    });
    return count > 0;
  }
}

export async function localUploadUrlExists(url: string) {
  const key = keyFromLocalUploadUrl(url);
  return key ? localUploadExists(key) : true;
}

function publicLocalUrl(key: string) {
  const publicBase = env.MEDIA_PUBLIC_URL?.trim();
  if (publicBase) return `${publicBase.replace(/\/$/, "")}/${key}`;
  return `/uploads/${key}`;
}

export const localStorageAdapter: StorageAdapter = {
  async putBuffer(buffer, key) {
    const fullPath = localUploadPath(key);
    try {
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, buffer);
      return { url: publicLocalUrl(key), provider: "local" };
    } catch {
      return { url: `/uploads/${key}`, provider: "mongo" };
    }
  },
  async delete(key) {
    await unlink(localUploadPath(key)).catch(() => undefined);
  },
};

let r2Client: S3Client | null = null;

function getR2Client() {
  const publicUrl = (env.R2_PUBLIC_URL ?? env.R2_PUBLIC_BASE_URL)?.trim();
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET || !publicUrl) {
    throw new Error("R2 is selected, but R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, and R2_PUBLIC_URL or R2_PUBLIC_BASE_URL are required.");
  }
  r2Client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
  return r2Client;
}

export const r2StorageAdapter: StorageAdapter = {
  async putBuffer(buffer, key, contentType) {
    const client = getR2Client();
    const publicUrl = (env.R2_PUBLIC_URL ?? env.R2_PUBLIC_BASE_URL)?.trim();
    await client.send(new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }));
    return {
      url: `${publicUrl!.replace(/\/$/, "")}/${key}`,
      provider: "r2",
    };
  },
  async delete() {
    return;
  },
};

export function getStorageAdapter() {
  return env.MEDIA_PROVIDER === "r2" ? r2StorageAdapter : localStorageAdapter;
}

function mediaKey(fileName: string, prefix = "media") {
  const baseName = fileName.replace(/\.[^.]+$/, "").replace(/[^a-z0-9.-]/gi, "-").replace(/-+/g, "-").toLowerCase();
  return `${prefix}/${Date.now()}-${baseName || "image"}.webp`;
}

export async function optimizeImage(file: File, options: { square?: boolean } = {}) {
  const validationError = validateImageUpload({ type: file.type, size: file.size });
  if (validationError) throw new Error(validationError);
  const input = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(input, { failOn: "none" }).metadata();
  const targetWidth = options.square ? 800 : metadata.width && metadata.width > 2400 ? 2400 : undefined;
  const pipeline = sharp(input, { failOn: "none" }).rotate();
  const resized = options.square
    ? pipeline.resize({ width: 800, height: 800, fit: "cover", withoutEnlargement: true })
    : pipeline.resize({ width: targetWidth, withoutEnlargement: true });
  const { data, info } = await resized.webp({ quality: options.square ? 84 : 82, effort: 4 }).toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, mimeType: "image/webp", fileSize: data.length };
}

export async function createMediaAsset(input: { file: File; alt?: string; prefix?: string; usageReferences?: string[]; square?: boolean }) {
  const optimized = await optimizeImage(input.file, { square: input.square });
  const key = mediaKey(input.file.name, input.prefix);
  const stored = await getStorageAdapter().putBuffer(optimized.data, key, optimized.mimeType);
  const alt = input.alt?.trim() || input.file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  const asset: StoredMediaAsset = {
    url: stored.url,
    alt,
    width: optimized.width,
    height: optimized.height,
    fileSize: optimized.fileSize,
    mimeType: optimized.mimeType,
    provider: stored.provider,
    usageReferences: input.usageReferences ?? [],
  };
  const update = stored.provider === "r2"
    ? { $set: asset, $unset: { data: "" } }
    : { $set: { ...asset, data: optimized.data } };
  await MediaAssetModel.updateOne({ url: asset.url }, update, { upsert: true });
  return asset;
}

export async function markMediaUsed(urls: Array<string | undefined>, reference: string) {
  const uniqueUrls = Array.from(new Set(urls.filter((url): url is string => Boolean(url))));
  if (!uniqueUrls.length) return;
  await MediaAssetModel.updateMany({ url: { $in: uniqueUrls } }, { $addToSet: { usageReferences: reference } });
}

export async function unmarkMediaUsed(urls: Array<string | undefined>, reference: string) {
  const uniqueUrls = Array.from(new Set(urls.filter((url): url is string => Boolean(url))));
  if (!uniqueUrls.length) return;
  await MediaAssetModel.updateMany({ url: { $in: uniqueUrls } }, { $pull: { usageReferences: reference } });
}
