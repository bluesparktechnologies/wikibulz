import { connectMongo } from "@/lib/db/mongoose";
import { getRedis } from "@/lib/redis/client";
import { getSessionUser } from "@/lib/auth/session";
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ application: "ok", time: new Date().toISOString() });
  const mongo = await connectMongo().then((db) => db ? "ok" : "not_configured").catch(() => "unavailable");
  const redis = await getRedis().then((client) => client ? "ok" : "not_configured").catch(() => "unavailable");
  return Response.json({ application: "ok", mongo, redis, time: new Date().toISOString() });
}
