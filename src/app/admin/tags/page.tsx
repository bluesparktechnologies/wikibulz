import { TagForm } from "@/components/admin/entity-forms";
import { requireRole } from "@/lib/auth/guards";
import { getAdminTags } from "@/repositories/admin.repository";

export default async function TagsAdminPage() {
  await requireRole("editor");
  const rows = await getAdminTags();
  return <><h1 className="text-4xl font-black">Tags</h1><p className="mt-2 text-[var(--muted)]">Tags default to noindex to avoid thin archive sprawl.</p><div className="mt-8"><TagForm /></div><div className="mt-8 rounded-lg border border-[var(--line)] bg-white"><table className="w-full text-left text-sm"><thead><tr><th className="p-4">Name</th><th>Slug</th><th>Index</th><th>Description</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[var(--line)]"><td className="p-4 font-bold">{row.name}</td><td>{row.slug}</td><td>{row.indexStatus}</td><td>{row.description}</td></tr>)}</tbody></table></div></>;
}

