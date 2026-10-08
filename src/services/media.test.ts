import { beforeEach, describe, expect, it, vi } from "vitest";
import { mongo } from "mongoose";
import sharp from "sharp";

const { lean, findOne, updateOne } = vi.hoisted(() => {
  const lean = vi.fn();
  return { lean, findOne: vi.fn(() => ({ select: vi.fn(() => ({ lean })) })), updateOne: vi.fn().mockResolvedValue({}) };
});
vi.mock("node:fs/promises", async (importOriginal) => ({
  ...await importOriginal<typeof import("node:fs/promises")>(),
  readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/validation/env", () => ({ env: { MEDIA_PUBLIC_URL: "http://localhost:3002/uploads" } }));
vi.mock("@/lib/db/mongoose", () => ({ connectMongo: vi.fn().mockResolvedValue({}) }));
vi.mock("@/models/schemas", () => ({
  MediaAssetModel: { findOne, updateOne },
}));

import { createMediaAsset, optimizeImage, readLocalUpload } from "./media";

describe("uploaded image storage", () => {
  beforeEach(() => lean.mockReset());

  it("preserves BSON image bytes when the disk file is missing", async () => {
    const image = Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0xff, 0x57]);
    lean.mockResolvedValue({ data: new mongo.Binary(image) });
    expect(await readLocalUpload("media/image.webp")).toEqual(image);
    expect(findOne).toHaveBeenCalledWith({ url: { $in: ["/uploads/media/image.webp", "http://localhost:3002/uploads/media/image.webp"] } });
  });

  it("also reads Buffer data returned by the database", async () => {
    const image = Buffer.from("image bytes");
    lean.mockResolvedValue({ data: image });
    expect(await readLocalUpload("media/image.webp")).toEqual(image);
  });

  it("produces a decodable WebP with the correct dimensions", async () => {
    const png = await sharp({ create: { width: 120, height: 80, channels: 3, background: "white" } }).png().toBuffer();
    const result = await optimizeImage(new File([new Uint8Array(png)], "image.png", { type: "image/png" }));
    const metadata = await sharp(result.data).metadata();
    expect(metadata.format).toBe("webp");
    expect([result.width, result.height]).toEqual([120, 80]);
    expect(result.fileSize).toBeGreaterThan(0);
  });

  it("returns a public same-origin URL even with a stale localhost media setting", async () => {
    const png = await sharp({ create: { width: 120, height: 80, channels: 3, background: "white" } }).png().toBuffer();
    const asset = await createMediaAsset({ file: new File([new Uint8Array(png)], "image.png", { type: "image/png" }) });
    expect(asset.url).toMatch(/^\/uploads\/media\/\d+-image\.webp$/);
    expect(updateOne).toHaveBeenCalledWith({ url: asset.url }, expect.objectContaining({ $set: expect.objectContaining({ data: expect.any(Buffer) }) }), { upsert: true });
  });
});
