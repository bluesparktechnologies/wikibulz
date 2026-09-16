import { connectMongo } from "@/lib/db/mongoose";
import { UserModel } from "@/models/schemas";
import type { UserRole } from "@/types/content";

export type AuthUserRecord = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  active: boolean;
};

type UserDoc = {
  _id: unknown;
  email?: unknown;
  name?: unknown;
  role?: unknown;
  passwordHash?: unknown;
  active?: unknown;
};

const validRoles: UserRole[] = ["admin", "editor", "author", "seo"];

export async function findUserByEmail(email: string): Promise<AuthUserRecord | null> {
  const db = await connectMongo();
  if (!db) return null;
  const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean<UserDoc>();
  if (!doc) return null;
  const role = typeof doc.role === "string" && validRoles.includes(doc.role as UserRole) ? (doc.role as UserRole) : "author";
  return {
    id: String(doc._id),
    email: typeof doc.email === "string" ? doc.email : email,
    name: typeof doc.name === "string" ? doc.name : "User",
    role,
    passwordHash: typeof doc.passwordHash === "string" ? doc.passwordHash : "",
    active: typeof doc.active === "boolean" ? doc.active : true,
  };
}

