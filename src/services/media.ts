import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/validation/env";

export type StoredMedia = {
  url: string;
  provider: "local" | "r2";
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

export const localStorageAdapter: StorageAdapter = {
  async putBuffer(buffer, key) {
    const fullPath = path.join(process.cwd(), "public", "uploads", key);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);
    return { url: `/uploads/${key}`, provider: "local" };
  },
  async delete(key) {
    await unlink(path.join(process.cwd(), "public", "uploads", key)).catch(() => undefined);
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
