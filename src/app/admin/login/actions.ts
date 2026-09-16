"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth/session";
import { findUserByEmail } from "@/repositories/users.repository";

export type LoginActionState = { ok: boolean; message: string };

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loginAction(_state: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });
  if (!parsed.success) return { ok: false, message: "Enter a valid email and password." };

  const user = await findUserByEmail(parsed.data.email);
  if (!user || !user.active || !user.passwordHash) return { ok: false, message: "Invalid credentials." };
  const validPassword = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!validPassword) return { ok: false, message: "Invalid credentials." };

  const token = signSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(token);
  redirect("/admin");
}

