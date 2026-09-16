import { PageForm } from "@/components/admin/entity-forms";
import { requireRole } from "@/lib/auth/guards";
import { getAdminPages } from "@/repositories/admin.repository";

export default async function PagesAdminPage() {
  await requireRole("editor");
  const rows = await getAdminPages();
  return <><h1 className="text-4xl font-black">Static Pages</h1><p className="mt-2 text-[var(--muted)]">Manage trust pages, policy pages, and custom SEO metadata.</p><div className="mt-8"><PageForm /></div><div className="mt-8 rounded-lg border border-[var(--line)] bg-white"><table className="w-full text-left text-sm"><thead><tr><th className="p-4">Title</th><th>Slug</th><th>Robots</th><th>Updated</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[var(--line)]"><td className="p-4 font-bold">{row.title}</td><td>{row.slug}</td><td>{row.robotsIndex ? "index" : "noindex"},{row.robotsFollow ? "follow" : "nofollow"}</td><td>{new Date(row.updatedAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></>;
}

