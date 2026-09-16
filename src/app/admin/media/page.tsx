import { requireUser } from "@/lib/auth/guards";
import { getAdminMedia } from "@/repositories/admin.repository";

export default async function MediaAdminPage() {
  await requireUser();
  const rows = await getAdminMedia();
  return <><h1 className="text-4xl font-black">Media Library</h1><p className="mt-2 text-[var(--muted)]">Upload images through the media API, then manage alt text, dimensions, provider, and usage references here.</p><form action="/api/admin/media" method="post" encType="multipart/form-data" className="mt-8 grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5 md:grid-cols-[1fr_1fr_auto]"><input name="file" type="file" accept="image/*" className="rounded border border-[var(--line)] px-3 py-2"/><input name="alt" placeholder="Alt text" className="rounded border border-[var(--line)] px-3 py-2"/><button className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Upload</button></form><div className="mt-8 grid gap-4 md:grid-cols-2">{rows.map((row) => <article key={row.id} className="rounded-lg border border-[var(--line)] bg-white p-4"><p className="font-bold break-all">{row.url}</p><p className="mt-2 text-sm text-[var(--muted)]">{row.alt}</p><p className="mt-2 text-xs text-[#617269]">{row.width}x{row.height} · {row.mimeType ?? "image"} · {row.provider}</p><p className="mt-2 text-xs text-[#617269]">Usage references: {row.usageReferences.length}</p></article>)}</div>{rows.length === 0 ? <p className="mt-6 text-sm text-[var(--muted)]">No media records yet.</p> : null}</>;
}

