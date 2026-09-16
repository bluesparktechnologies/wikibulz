import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getNotFoundReport } from "@/services/not-found";

export default async function NotFoundAdminPage() {
  await requireRole("seo");
  const rows = await getNotFoundReport();
  return (
    <>
      <h1 className="text-4xl font-black">404 Management</h1>
      <p className="mt-2 text-[var(--muted)]">Important missing URLs are tracked here. Obvious bot probes are filtered before storage.</p>
      <div className="mt-8 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f5faf7]"><tr><th className="p-4">URL</th><th>Hits</th><th>First Seen</th><th>Last Seen</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.url} className="border-t border-[var(--line)]">
                <td className="p-4 font-semibold">{row.url}</td>
                <td>{row.hitCount}</td>
                <td>{row.firstSeen ? new Date(row.firstSeen).toLocaleDateString() : "-"}</td>
                <td>{row.lastSeen ? new Date(row.lastSeen).toLocaleDateString() : "-"}</td>
                <td><Link href={`/admin/redirects?source=${encodeURIComponent(row.url)}`} className="font-bold text-[var(--brand)]">Create redirect</Link></td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td className="p-4 text-[var(--muted)]" colSpan={5}>No tracked 404s yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

