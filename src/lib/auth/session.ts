import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env } from "@/lib/validation/env";
import type { UserRole } from "@/types/content";

export type SessionUser = { id: string; email: string; name: string; role: UserRole };
const cookieName = "wikibulz_session";
export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }
export function signSession(user: SessionUser) { if (!env.JWT_SECRET) throw new Error("JWT_SECRET is required for authentication"); return jwt.sign(user, env.JWT_SECRET, { expiresIn: "8h" }); }
export async function getSessionUser() { const token = (await cookies()).get(cookieName)?.value; if (!token || !env.JWT_SECRET) return null; try { return jwt.verify(token, env.JWT_SECRET) as SessionUser; } catch { return null; } }
export async function setSessionCookie(token: string) { (await cookies()).set(cookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 }); }
export async function clearSessionCookie() { (await cookies()).delete(cookieName); }
export function canPublish(role: UserRole) { return role === "admin" || role === "editor"; }
