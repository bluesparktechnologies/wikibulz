import { connectMongo } from "@/lib/db/mongoose";
import { invalidatePost } from "@/lib/cache/invalidation";
import { PostModel, postCategoryPopulate } from "@/models/schemas";
import { mapPost } from "@/repositories/mappers";
import { withAutomationLock } from "@/modules/autoblog/jobs/locks";
import { PublishingQueueModel } from "@/modules/autoblog/models/schemas";
import { findArticlePublicationBlockers } from "@/modules/autoblog/quality/article-quality";

export async function publishQueueItemExactlyOnce(queueItemId: string) {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is required for publishing.");
  const result = await withAutomationLock(`publish:${queueItemId}`, async () => {
    const queueItem = await PublishingQueueModel.findOneAndUpdate(
      { _id: queueItemId, status: { $in: ["READY", "SCHEDULED"] } },
      { $set: { status: "PUBLISHING" }, $inc: { publishAttempts: 1 } },
      { returnDocument: "after" },
    );
    if (!queueItem) return { ok: false as const, reason: "Queue item is not ready or was already processed." };
    if (!queueItem.factCheckPassed || !queueItem.seoPassed || !queueItem.imagesReady) {
      await PublishingQueueModel.updateOne({ _id: queueItemId }, { $set: { status: "REVIEW_REQUIRED", lastError: "Required publishing gates did not pass." } });
      return { ok: false as const, reason: "Required publishing gates did not pass." };
    }
    const currentPost = await PostModel.findOne({ _id: queueItem.postId, status: { $in: ["review", "scheduled"] }, robotsIndex: true }).populate("author reviewer factCheckedBy tags").populate(postCategoryPopulate).lean();
    if (!currentPost) {
      await PublishingQueueModel.updateOne({ _id: queueItemId }, { $set: { status: "FAILED", lastError: "Post was not publishable or was already published." } });
      return { ok: false as const, reason: "Post was not publishable or was already published." };
    }
    const mappedCurrent = mapPost(JSON.parse(JSON.stringify(currentPost)));
    const contentBlockers = findArticlePublicationBlockers(mappedCurrent);
    if (contentBlockers.length) {
      await PublishingQueueModel.updateOne({ _id: queueItemId }, { $set: { status: "REVIEW_REQUIRED", lastError: contentBlockers.join(" ") } });
      return { ok: false as const, reason: contentBlockers.join(" ") };
    }
    const post = await PostModel.findByIdAndUpdate(
      queueItem.postId,
      { $set: { status: "published", publishedAt: new Date(), scheduledAt: null, canonicalUrl: null } },
      { returnDocument: "after", runValidators: true },
    ).populate("author reviewer factCheckedBy tags").populate(postCategoryPopulate).lean();
    if (!post) {
      await PublishingQueueModel.updateOne({ _id: queueItemId }, { $set: { status: "FAILED", lastError: "Post was not publishable or was already published." } });
      return { ok: false as const, reason: "Post was not publishable or was already published." };
    }
    const mapped = mapPost(JSON.parse(JSON.stringify(post)));
    await invalidatePost(mapped);
    await PublishingQueueModel.updateOne({ _id: queueItemId }, { $set: { status: "PUBLISHED", publishedAt: new Date() } });
    return { ok: true as const, postId: mapped.id };
  }, 120);
  if (!result.ok) return { ok: false as const, reason: result.message };
  return result.value;
}
