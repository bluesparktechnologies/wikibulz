import { connectMongo } from "../src/lib/db/mongoose";
import { AuthorModel, CategoryModel, InternalLinkModel, MediaAssetModel, NewsletterSubscriberModel, NotFoundModel, PageModel, PostModel, RedirectModel, RevalidationLogModel, SeoRevisionModel, TagModel, UserModel } from "../src/models/schemas";
import { AIUsageRecordModel, AutomationArtifactModel, AutomationNotificationModel, AutomationRunModel, AutomationSettingsModel, AutoblogKeywordModel, EditorialProfileModel, GscPerformanceModel, PlagiarismScanModel, PromptTemplateModel, ProviderHealthModel, ProviderSettingsModel, PublishingQueueModel, RefreshCandidateModel, ResearchSourceModel, RoiRecordModel, SeoExperimentModel, SerpSnapshotModel, SiteNicheProfileModel, TopicClusterModel } from "../src/modules/autoblog/models/schemas";

async function main() {
  const db = await connectMongo();
  if (!db) throw new Error("MONGODB_URI is required to run migrations.");
  await Promise.all([
    AuthorModel.syncIndexes(),
    CategoryModel.syncIndexes(),
    TagModel.syncIndexes(),
    PostModel.syncIndexes(),
    PageModel.syncIndexes(),
    RedirectModel.syncIndexes(),
    InternalLinkModel.syncIndexes(),
    NotFoundModel.syncIndexes(),
    UserModel.syncIndexes(),
    MediaAssetModel.syncIndexes(),
    SeoRevisionModel.syncIndexes(),
    RevalidationLogModel.syncIndexes(),
    NewsletterSubscriberModel.syncIndexes(),
    AutomationRunModel.syncIndexes(),
    AutomationSettingsModel.syncIndexes(),
    SiteNicheProfileModel.syncIndexes(),
    EditorialProfileModel.syncIndexes(),
    ProviderSettingsModel.syncIndexes(),
    AIUsageRecordModel.syncIndexes(),
    PromptTemplateModel.syncIndexes(),
    AutomationNotificationModel.syncIndexes(),
    AutomationArtifactModel.syncIndexes(),
    PlagiarismScanModel.syncIndexes(),
    AutoblogKeywordModel.syncIndexes(),
    TopicClusterModel.syncIndexes(),
    PublishingQueueModel.syncIndexes(),
    ProviderHealthModel.syncIndexes(),
    SerpSnapshotModel.syncIndexes(),
    ResearchSourceModel.syncIndexes(),
    GscPerformanceModel.syncIndexes(),
    RefreshCandidateModel.syncIndexes(),
    SeoExperimentModel.syncIndexes(),
    RoiRecordModel.syncIndexes(),
  ]);
  console.log("Initial indexes synced.");
}

main().then(() => process.exit(0)).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
