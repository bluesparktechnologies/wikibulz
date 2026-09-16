import { requireRole } from "@/lib/auth/guards";

export default async function SeoInspectorPage({ searchParams }: { searchParams?: Promise<{ path?: string }> }) {
  await requireRole("seo");
  const path = (await searchParams)?.path ?? "/investing/best-index-funds";
  return <><h1 className="text-4xl font-black">URL Inspector</h1><p className="mt-2 text-[var(--muted)]">Internal application inspection only. This does not claim actual Google index status.</p><form className="mt-8 flex gap-3"><input name="path" defaultValue={path} className="min-w-0 flex-1 rounded border border-[var(--line)] px-3 py-2"/><button className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Inspect</button></form><div className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5"><p className="font-bold">API endpoint</p><code className="mt-2 block break-all text-sm text-[var(--muted)]">/api/admin/seo/inspect?path={encodeURIComponent(path)}</code><p className="mt-4 text-sm text-[var(--muted)]">Use this endpoint after logging in to inspect status, canonical, robots, schema types, sitemap inclusion, and internal links.</p></div></>;
}

