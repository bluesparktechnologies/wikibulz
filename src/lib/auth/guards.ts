import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import type { UserRole } from "@/types/content";

const roleRank: Record<UserRole, number> = {
  author: 1,
  seo: 2,
  editor: 3,
  admin: 4,
};

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireRole(minimumRole: UserRole) {
  const user = await requireUser();
  if (roleRank[user.role] < roleRank[minimumRole]) redirect("/admin");
  return user;
}

