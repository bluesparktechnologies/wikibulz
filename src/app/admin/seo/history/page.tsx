import { requireRole } from "@/lib/auth/guards";
import { getSeoRevisions } from "@/repositories/admin.repository";

export default async function SeoHistoryPage() {
  await requireRole("seo");
  const rows = await getSeoRevisions();
  return <><h1 className="text-4xl font-black">SEO Change History</h1><p className="mt-2 text-[var(--muted)]">Tracks important SEO field revisions such as title, description, canonical, robots, and slug.</p><div className="mt-8 rounded-lg border border-[var(--line)] bg-white"><table className="w-full text-left text-sm"><thead><tr><th className="p-4">Entity</th><th>Field</th><th>Previous</th><th>Next</th><th>Changed By</th><th>Date</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[var(--line)]"><td className="p-4">{row.entityType}:{row.entityId}</td><td>{row.field}</td><td className="max-w-xs truncate">{row.previousValue}</td><td className="max-w-xs truncate">{row.nextValue}</td><td>{row.changedBy}</td><td>{new Date(row.createdAt).toLocaleString()}</td></tr>)}{rows.length === 0 ? <tr><td className="p-4 text-[var(--muted)]" colSpan={6}>No SEO revisions recorded yet.</td></tr> : null}</tbody></table></div></>;
}

