import Link from "next/link";
import { AuthorForm } from "@/components/admin/entity-forms";
import { deleteAuthorAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth/guards";
import { getAdminAuthors } from "@/repositories/admin.repository";

export default async function AuthorsAdminPage({ searchParams }: { searchParams?: Promise<{ edit?: string; error?: string; message?: string }> }) {
  await requireRole("editor");
  const rows = await getAdminAuthors();
  const query = await searchParams;
  const editing = rows.find((row) => row.id === query?.edit);
  return <><h1 className="text-4xl font-black">Authors</h1><p className="mt-2 text-[var(--muted)]">Authorship and E-E-A-T fields are manually entered. The system does not fabricate credentials.</p>{query?.error ? <p className="mt-4 text-sm text-red-700">{query.error}</p> : null}{query?.message ? <p className="mt-4 text-sm text-green-700">{query.message}</p> : null}<div className="mt-8">{editing ? <div><div className="mb-3 flex items-center justify-between"><h2 className="text-2xl font-black">Edit Author</h2><Link href="/admin/authors" className="text-sm font-bold text-[var(--brand)]">Cancel</Link></div><AuthorForm author={editing}/></div> : <AuthorForm />}</div><div className="mt-8 overflow-x-auto rounded-lg border border-[var(--line)] bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr><th className="p-4">Name</th><th>Email</th><th>Title</th><th>Expertise</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[var(--line)]"><td className="p-4 font-bold">{row.name}</td><td>{row.email}</td><td>{row.jobTitle}</td><td>{row.expertise.join(", ")}</td><td>{row.status}</td><td><div className="flex gap-2"><Link href={`/admin/authors?edit=${row.id}`} className="rounded border border-[var(--line)] px-3 py-1 text-xs font-bold">Edit</Link><form action={deleteAuthorAction}><input type="hidden" name="id" value={row.id}/><button className="rounded border border-red-300 px-3 py-1 text-xs font-bold text-red-700">Delete</button></form></div></td></tr>)}</tbody></table></div></>;
}
