import { connectMongo } from "@/lib/db/mongoose";
import { PublishingQueueModel } from "@/modules/autoblog/models/schemas";
import { publishQueueItemExactlyOnce } from "@/modules/autoblog/publishing/publisher";

export async function publishDueQueueItems(now = new Date()) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required.");
  const dueItems = await PublishingQueueModel.find({ status: "SCHEDULED", scheduledFor: { $lte: now } }).select("_id").lean();
  let published = 0;
  let failed = 0;
  for (const item of dueItems) {
    const result = await publishQueueItemExactlyOnce(String(item._id));
    if (result.ok) published += 1;
    else failed += 1;
  }
  return { published, failed, checked: dueItems.length };
}
