"use client";

import Image from "next/image";
import { useState } from "react";
import type { AdminMedia } from "@/repositories/admin.repository";
import type { MediaAsset } from "@/types/content";

export function FeaturedImageFields({ currentImage, media }: { currentImage?: MediaAsset; media: AdminMedia[] }) {
  const [url, setUrl] = useState(currentImage?.url ?? "");
  const [alt, setAlt] = useState(currentImage?.alt ?? "");

  function chooseMedia(value: string) {
    const item = media.find((asset) => asset.url === value);
    setUrl(value);
    if (item?.alt) setAlt(item.alt);
  }

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 rounded-lg border border-[var(--line)] bg-[#f7faf8] p-4">
      <div className="grid min-w-0 gap-2 text-sm font-bold">
        Upload New Featured Image
        <input name="featuredImageFile" type="file" accept="image/*" className="min-w-0 w-full rounded border border-[var(--line)] bg-white px-3 py-2" />
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
          <input name="featuredImageUrl" value={url} onChange={(event) => setUrl(event.target.value)} className="min-w-0 w-full rounded border border-[var(--line)] bg-white px-3 py-2" />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Featured Image Alt
          <input name="featuredImageAlt" value={alt} onChange={(event) => setAlt(event.target.value)} className="min-w-0 w-full rounded border border-[var(--line)] bg-white px-3 py-2" />
        </label>
      </div>
      {url ? <Image src={url} alt={alt || "Featured image preview"} width={360} height={203} unoptimized className="max-h-56 w-fit rounded border border-[var(--line)] object-cover" /> : null}
    </div>
  );
}
