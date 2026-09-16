import { connectMongo } from "../src/lib/db/mongoose";
import { NotFoundModel } from "../src/models/schemas";

async function main() {
  const db = await connectMongo();
  if (!db) throw new Error("MONGODB_URI is required.");
  const retentionDays = Number(process.env.NOT_FOUND_RETENTION_DAYS ?? 90);
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const result = await NotFoundModel.deleteMany({ lastSeen: { $lt: cutoff }, hitCount: { $lt: 3 } });
  console.log(`Deleted ${result.deletedCount} low-value tracked 404s older than ${retentionDays} days.`);
}

main().then(() => process.exit(0)).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

