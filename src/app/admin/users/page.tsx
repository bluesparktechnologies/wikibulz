import { UserForm } from "@/components/admin/entity-forms";
import { requireRole } from "@/lib/auth/guards";
import { getAdminUsers } from "@/repositories/admin.repository";

export default async function UsersAdminPage() {
  await requireRole("admin");
  const rows = await getAdminUsers();
  return <><h1 className="text-4xl font-black">Users and Roles</h1><p className="mt-2 text-[var(--muted)]">Admin manages accounts. Passwords are hashed before storage.</p><div className="mt-8"><UserForm /></div><div className="mt-8 rounded-lg border border-[var(--line)] bg-white"><table className="w-full text-left text-sm"><thead><tr><th className="p-4">Name</th><th>Email</th><th>Role</th><th>Active</th><th>Updated</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[var(--line)]"><td className="p-4 font-bold">{row.name}</td><td>{row.email}</td><td>{row.role}</td><td>{row.active ? "yes" : "no"}</td><td>{new Date(row.updatedAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></>;
}

