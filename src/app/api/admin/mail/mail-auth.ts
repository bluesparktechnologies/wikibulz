import { getSessionUser } from "@/lib/auth/session";

export async function requireMailAdmin() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Administrator access required." }, { status: 403 });
  return null;
}
