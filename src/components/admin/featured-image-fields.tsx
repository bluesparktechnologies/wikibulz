"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { AdminMedia } from "@/repositories/admin.repository";
import type { MediaAsset } from "@/types/content";

export function FeaturedImageFields({ currentImage, media }: { currentImage?: MediaAsset; media: AdminMedia[] }) {
  const [url, setUrl] = useState(currentImage?.url ?? "");
  const [alt, setAlt] = useState(currentImage?.alt ?? "");
  const [width, setWidth] = useState(currentImage?.width ?? 1600);
  const [height, setHeight] = useState(currentImage?.height ?? 900);
  const [previewUrl, setPreviewUrl] = useState("");
  const [broken, setBroken] = useState(false);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function chooseMedia(value: string) {
    const item = media.find((asset) => asset.url === value);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setBroken(false);
    setUrl(value);
    if (item?.alt) setAlt(item.alt);
    if (item?.width) setWidth(item.width);
    if (item?.height) setHeight(item.height);
  }

  function chooseFile(file?: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
    setBroken(false);
    if (file) setUrl("");
    if (file && !alt) setAlt(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  }

  const visiblePreview = previewUrl || url;

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 rounded-lg border border-[var(--line)] bg-[#f7faf8] p-4">
      <div className="grid min-w-0 gap-2 text-sm font-bold">
        Upload New Featured Image
        <input name="featuredImageFile" type="file" accept="image/*" onChange={(event) => chooseFile(event.target.files?.[0])} className="min-w-0 w-full rounded border border-[var(--line)] bg-white px-3 py-2" />
      </div>
      {media.length > 0 ? (
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Or Choose From Media Library
          <select value={url} onChange={(event) => chooseMedia(event.target.value)} className="min-w-0 w-full rounded border border-[var(--line)] bg-white px-3 py-2">
            <option value="">Select image</option>
            {media.map((asset) => <option key={asset.id} value={asset.url}>{asset.alt || asset.url}</option>)}
          </select>
        </label>
      ) : null}
      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Featured Image URL
          <input name="featuredImageUrl" value={url} onChange={(event) => { setBroken(false); setUrl(event.target.value); }} className="min-w-0 w-full rounded border border-[var(--line)] bg-white px-3 py-2" />
          {previewUrl ? <span className="text-xs font-semibold text-[var(--muted)]">New image selected. Save post to generate its URL.</span> : null}
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
