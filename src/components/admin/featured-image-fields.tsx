"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { AdminMedia } from "@/repositories/admin.repository";
import type { MediaAsset } from "@/types/content";

function getAdminMediaEndpoint() {
  if (typeof window === "undefined") return "/api/admin/media";
  const [adminPrefix] = window.location.pathname.split("/").filter(Boolean);
  if (adminPrefix && adminPrefix !== "admin") return `/${adminPrefix}/api/media`;
  return "/api/admin/media";
}

async function readUploadResponse(response: Response) {
  if (response.status === 413) return { error: "The server rejected this image because its upload limit is too small. Please contact the administrator." };
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text().catch(() => "");
  return { error: text ? text.slice(0, 180) : `Image upload failed (${response.status}).` };
}

export function FeaturedImageFields({ currentImage, media, onUploadBlocked }: { currentImage?: MediaAsset; media: AdminMedia[]; onUploadBlocked?: (blocked: boolean) => void }) {
  const [url, setUrl] = useState(currentImage?.url ?? "");
  const [alt, setAlt] = useState(currentImage?.alt ?? "");
  const [width, setWidth] = useState(currentImage?.width ?? 1600);
  const [height, setHeight] = useState(currentImage?.height ?? 900);
  const [previewUrl, setPreviewUrl] = useState("");
  const [broken, setBroken] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function chooseMedia(value: string) {
    onUploadBlocked?.(false);
    setUploadMessage("");
    const item = media.find((asset) => asset.url === value);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setBroken(false);
    setUrl(value);
    if (item?.alt) setAlt(item.alt);
    if (item?.width) setWidth(item.width);
    if (item?.height) setHeight(item.height);
  }

  async function chooseFile(file?: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
    setBroken(false);
    setUploadMessage("");
    if (file && !alt) setAlt(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    if (!file) return;
    onUploadBlocked?.(true);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("alt", alt || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      const response = await fetch(getAdminMediaEndpoint(), {
        method: "POST",
        body: formData,
        headers: { accept: "application/json" },
      });
      const payload = await readUploadResponse(response);
      if (!response.ok || !payload?.url) throw new Error(payload?.error || `Image upload failed (${response.status}).`);
      setUrl(payload.url);
      setWidth(payload.width || 1600);
      setHeight(payload.height || 900);
      if (payload.alt) setAlt(payload.alt);
      setPreviewUrl("");
      onUploadBlocked?.(false);
      setUploadMessage("Image uploaded. Save post to apply it.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const visiblePreview = previewUrl || url;

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 rounded-lg border border-[var(--line)] bg-[#f7faf8] p-4">
      <div className="grid min-w-0 gap-2 text-sm font-bold">
        Upload New Featured Image
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(event) => { void chooseFile(event.target.files?.[0]); }} className="min-w-0 w-full rounded border border-[var(--line)] bg-white px-3 py-2" />
        {uploading ? <span className="text-xs font-semibold text-[var(--muted)]">Uploading image...</span> : null}
        {uploadMessage ? <span role="status" className={`text-xs font-semibold ${uploadMessage.startsWith("Image uploaded.") ? "text-green-700" : "text-red-700"}`}>{uploadMessage}</span> : null}
      </div>
      {media.length > 0 ? (
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Or Choose From Media Library
          <select value={url} disabled={uploading} onChange={(event) => chooseMedia(event.target.value)} className="min-w-0 w-full rounded border border-[var(--line)] bg-white px-3 py-2">
            <option value="">Select image</option>
            {media.map((asset) => <option key={asset.id} value={asset.url}>{asset.alt || asset.url}</option>)}
          </select>
        </label>
      ) : null}
      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Featured Image URL
          <input name="featuredImageUrl" value={url} readOnly={uploading} onChange={(event) => { setBroken(false); setPreviewUrl(""); setUploadMessage(""); onUploadBlocked?.(false); setUrl(event.target.value); }} className="min-w-0 w-full rounded border border-[var(--line)] bg-white px-3 py-2" />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Featured Image Alt
          <input name="featuredImageAlt" value={alt} onChange={(event) => setAlt(event.target.value)} className="min-w-0 w-full rounded border border-[var(--line)] bg-white px-3 py-2" />
        </label>
      </div>
      <input type="hidden" name="featuredImageWidth" value={width} />
      <input type="hidden" name="featuredImageHeight" value={height} />
      {visiblePreview ? (
        <div className="grid gap-2">
          {broken ? <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-800">Image preview failed. Check that this URL returns a public image response.</div> : null}
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={alt || "Selected image preview"} className="max-h-56 w-fit rounded border border-[var(--line)] object-cover" />
          ) : (
            <Image src={url} alt={alt || "Featured image preview"} width={width} height={height} unoptimized onError={() => setBroken(true)} className="max-h-56 w-fit rounded border border-[var(--line)] object-cover" />
          )}
        </div>
      ) : null}
    </div>
  );
}
