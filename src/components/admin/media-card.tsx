"use client";

import Image from "next/image";
import { useState } from "react";
import type { AdminMedia } from "@/repositories/admin.repository";

export function MediaCard({ asset }: { asset: AdminMedia }) {
  const [broken, setBroken] = useState(false);

  return (
    <article className="grid gap-3 rounded-lg border border-[var(--line)] bg-white p-4">
      <div className="aspect-video overflow-hidden rounded-md border border-[var(--line)] bg-[#f2f6f4]">
        {broken ? (
          <div className="grid h-full place-items-center px-4 text-center text-sm font-semibold text-amber-800">Preview failed. URL may not be publicly reachable.</div>
        ) : (
          <Image src={asset.url} alt={asset.alt || "Media preview"} width={asset.width || 640} height={asset.height || 360} unoptimized onError={() => setBroken(true)} className="h-full w-full object-cover" />
        )}
      </div>
      <div>
        <p className="break-all text-sm font-bold">{asset.url}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{asset.alt}</p>
        <p className="mt-2 text-xs text-[#617269]">{asset.width}x{asset.height} - {asset.mimeType ?? "image"} - {asset.provider}</p>
        <p className="mt-2 text-xs font-semibold text-[#617269]">Usage references: {asset.usageReferences.length}</p>
      </div>
    </article>
  );
}
