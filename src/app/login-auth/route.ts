import { z } from "zod";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth/session";
import { findUserByEmail } from "@/repositories/users.repository";
import { isLoginRateLimited, loginRateLimitKey } from "@/lib/auth/rate-limit";

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(request: Request) {
  const parsed = LoginSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Enter a valid email and password." }, { status: 400 });
  if (isLoginRateLimited(loginRateLimitKey(request, parsed.data.email))) return Response.json({ error: "Too many login attempts. Try again later." }, { status: 429, headers: { "Retry-After": "900" } });

  const user = await findUserByEmail(parsed.data.email);
  if (!user || !user.active || !user.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return Response.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role };
  await setSessionCookie(signSession(sessionUser));
  return Response.json({ user: sessionUser });
}
