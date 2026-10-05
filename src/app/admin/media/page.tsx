import { MediaCard } from "@/components/admin/media-card";
import { requireUser } from "@/lib/auth/guards";
import { getAdminMedia } from "@/repositories/admin.repository";

export default async function MediaAdminPage({ searchParams }: { searchParams?: Promise<{ error?: string; message?: string; url?: string }> }) {
  await requireUser();
  const [rows, query] = await Promise.all([getAdminMedia(), searchParams]);

  return <>
    <h1 className="text-4xl font-black">Media Library</h1>
    <p className="mt-2 text-[var(--muted)]">Upload optimized WebP images, then reuse the saved public URL in posts, OG images, author profiles, and content blocks.</p>
    {query?.message ? <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{query.message}{query.url ? ` ${query.url}` : ""}</p> : null}
    {query?.error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{query.error}</p> : null}
    <form action="/api/admin/media" method="post" encType="multipart/form-data" className="mt-8 grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5 md:grid-cols-[1fr_1fr_auto]">
      <input name="file" type="file" accept="image/*" required className="rounded border border-[var(--line)] px-3 py-2"/>
      <input name="alt" placeholder="Alt text" className="rounded border border-[var(--line)] px-3 py-2"/>
      <button className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Upload</button>
    </form>
    <div className="mt-8 grid gap-4 md:grid-cols-2">{rows.map((row) => <MediaCard key={row.id} asset={row}/>)}</div>
    {rows.length === 0 ? <p className="mt-6 text-sm text-[var(--muted)]">No media records yet.</p> : null}
  </>;
}
