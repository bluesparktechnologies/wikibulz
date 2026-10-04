import mongoose, { Schema } from "mongoose";

const MediaSchema = new Schema({ url: { type: String, required: true }, alt: { type: String, required: true }, width: Number, height: Number, caption: String, credit: String }, { _id: false });
const SourceSchema = new Schema({ title: { type: String, required: true }, url: { type: String, required: true }, publisher: String, dateAccessed: Date }, { _id: false });

const AuthorSchema = new Schema({ name: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true }, email: { type: String, required: true }, bio: String, avatar: MediaSchema, jobTitle: String, expertise: [String], credentials: [String], socialLinks: [String], website: String, status: { type: String, enum: ["active", "inactive"], default: "active", index: true } }, { timestamps: true });

const CategorySchema = new Schema({ name: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true }, description: String, seoTitle: String, metaDescription: String, canonicalUrl: String, indexStatus: { type: String, enum: ["index", "noindex"], default: "index" }, parentCategory: { type: Schema.Types.ObjectId, ref: "Category", index: true }, featuredImage: MediaSchema }, { timestamps: true });

const TagSchema = new Schema({ name: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true }, description: String, indexStatus: { type: String, enum: ["index", "noindex"], default: "noindex" } }, { timestamps: true });

const SeoLocationFields = { description: String, seoTitle: String, metaDescription: String, canonicalUrl: String, indexStatus: { type: String, enum: ["index", "noindex"], default: "index", index: true }, status: { type: String, enum: ["active", "inactive"], default: "active", index: true } };
const CountrySchema = new Schema({ name: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true }, ...SeoLocationFields }, { timestamps: true });
const StateSchema = new Schema({ name: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true }, country: { type: Schema.Types.ObjectId, ref: "Country", required: true, index: true }, ...SeoLocationFields }, { timestamps: true });
const CitySchema = new Schema({ name: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true }, state: { type: Schema.Types.ObjectId, ref: "State", required: true, index: true }, country: { type: Schema.Types.ObjectId, ref: "Country", required: true, index: true }, ...SeoLocationFields }, { timestamps: true });

const PostSchema = new Schema({ title: { type: String, required: true, index: true }, slug: { type: String, required: true, unique: true, index: true }, excerpt: String, content: { type: String, required: true }, featuredImage: MediaSchema, author: { type: Schema.Types.ObjectId, ref: "Author", required: true, index: true }, reviewer: { type: Schema.Types.ObjectId, ref: "Author" }, country: { type: Schema.Types.ObjectId, ref: "Country", index: true }, state: { type: Schema.Types.ObjectId, ref: "State", index: true }, city: { type: Schema.Types.ObjectId, ref: "City", index: true }, category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true }, tags: [{ type: Schema.Types.ObjectId, ref: "Tag", index: true }], status: { type: String, enum: ["draft", "review", "scheduled", "published", "archived", "trash"], default: "draft", index: true }, publishedAt: { type: Date, index: true }, scheduledAt: Date, seoTitle: { type: String, index: true }, metaDescription: { type: String, index: true }, canonicalUrl: String, robotsIndex: { type: Boolean, default: true }, robotsFollow: { type: Boolean, default: true }, focusKeyword: { type: String, index: true }, secondaryKeywords: [String], ogTitle: String, ogDescription: String, ogImage: MediaSchema, twitterTitle: String, twitterDescription: String, twitterImage: MediaSchema, schemaType: { type: String, enum: ["Article", "BlogPosting", "NewsArticle"], default: "BlogPosting" }, featured: { type: Boolean, default: false, index: true }, editorPick: { type: Boolean, default: false, index: true }, readingTime: Number, wordCount: Number, views: { type: Number, default: 0, index: true }, shares: { type: Number, default: 0 }, tableOfContents: [{ id: String, text: String, level: Number }], relatedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }], manualInternalLinks: [{ type: Schema.Types.ObjectId, ref: "Post" }], sources: [SourceSchema], references: [SourceSchema], faqs: [{ question: String, answer: String }], reviewedBy: String, factCheckedBy: { type: Schema.Types.ObjectId, ref: "Author" }, lastReviewedAt: Date, redirectHistory: [String], wikibulzScore: Number, scoreBreakdown: Schema.Types.Mixed, scoreMethodologyVersion: String, scoreUpdatedAt: Date }, { timestamps: true });
PostSchema.add({ publicId: { type: String, unique: true, sparse: true, index: true } });
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ category: 1, status: 1, publishedAt: -1 });
PostSchema.index({ author: 1, status: 1, publishedAt: -1 });
PostSchema.index({ city: 1, category: 1, status: 1, publishedAt: -1 });
PostSchema.index({ state: 1, category: 1, status: 1, publishedAt: -1 });
PostSchema.index({ country: 1, category: 1, status: 1, publishedAt: -1 });
PostSchema.index({ tags: 1, status: 1, publishedAt: -1 });
PostSchema.index({ title: "text", excerpt: "text", focusKeyword: "text", secondaryKeywords: "text" });

const PageSchema = new Schema({ title: { type: String, required: true }, slug: { type: String, required: true, unique: true, index: true }, excerpt: String, content: String, seoTitle: String, metaDescription: String, canonicalUrl: String, robotsIndex: { type: Boolean, default: true }, robotsFollow: { type: Boolean, default: true } }, { timestamps: true });
const RedirectSchema = new Schema({ sourcePath: { type: String, required: true, unique: true, index: true }, destinationPath: { type: String, required: true }, statusCode: { type: Number, enum: [301, 302, 307, 308], default: 301 }, active: { type: Boolean, default: true, index: true } }, { timestamps: true });
const InternalLinkSchema = new Schema({ sourcePost: { type: Schema.Types.ObjectId, ref: "Post", index: true }, targetPost: { type: Schema.Types.ObjectId, ref: "Post", index: true }, anchorText: String, linkType: { type: String, enum: ["manual", "suggested", "contextual"], default: "manual" } }, { timestamps: true });
const NotFoundSchema = new Schema({ url: { type: String, required: true, index: true }, hitCount: { type: Number, default: 1 }, firstSeen: Date, lastSeen: Date, referrer: String }, { timestamps: true });
const UserSchema = new Schema({ name: String, email: { type: String, required: true, unique: true, index: true }, passwordHash: String, role: { type: String, enum: ["admin", "editor", "author", "seo"], default: "author", index: true }, active: { type: Boolean, default: true } }, { timestamps: true });
const MediaAssetSchema = new Schema({ url: { type: String, required: true, unique: true, index: true }, alt: { type: String, required: true }, caption: String, credit: String, fileSize: Number, mimeType: String, width: Number, height: Number, provider: { type: String, default: "local", index: true }, usageReferences: [String] }, { timestamps: true });
const SeoRevisionSchema = new Schema({ entityType: { type: String, required: true, index: true }, entityId: { type: String, required: true, index: true }, field: { type: String, required: true, index: true }, previousValue: String, nextValue: String, changedBy: String }, { timestamps: true });
const RevalidationLogSchema = new Schema({ path: { type: String, required: true, index: true }, requestedBy: String, status: { type: String, enum: ["success", "failed"], default: "success", index: true }, message: String }, { timestamps: true });
const NewsletterSubscriberSchema = new Schema({ email: { type: String, required: true, unique: true, index: true }, source: String, status: { type: String, enum: ["active", "unsubscribed"], default: "active", index: true } }, { timestamps: true });

export const AuthorModel = mongoose.models.Author || mongoose.model("Author", AuthorSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model("Category", CategorySchema);
export const TagModel = mongoose.models.Tag || mongoose.model("Tag", TagSchema);
export const CountryModel = mongoose.models.Country || mongoose.model("Country", CountrySchema);
export const StateModel = mongoose.models.State || mongoose.model("State", StateSchema);
export const CityModel = mongoose.models.City || mongoose.model("City", CitySchema);
export const PostModel = mongoose.models.Post || mongoose.model("Post", PostSchema);
export const PageModel = mongoose.models.Page || mongoose.model("Page", PageSchema);
export const RedirectModel = mongoose.models.Redirect || mongoose.model("Redirect", RedirectSchema);
export const InternalLinkModel = mongoose.models.InternalLink || mongoose.model("InternalLink", InternalLinkSchema);
export const NotFoundModel = mongoose.models.NotFound || mongoose.model("NotFound", NotFoundSchema);
export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export const MediaAssetModel = mongoose.models.MediaAsset || mongoose.model("MediaAsset", MediaAssetSchema);
export const SeoRevisionModel = mongoose.models.SeoRevision || mongoose.model("SeoRevision", SeoRevisionSchema);
export const RevalidationLogModel = mongoose.models.RevalidationLog || mongoose.model("RevalidationLog", RevalidationLogSchema);
export const NewsletterSubscriberModel = mongoose.models.NewsletterSubscriber || mongoose.model("NewsletterSubscriber", NewsletterSubscriberSchema);

export const postCategoryPopulate = {
  path: "category",
  populate: {
    path: "parentCategory",
    populate: { path: "parentCategory" },
  },
} as const;

export const postLocationPopulate = [
  "country",
  { path: "state", populate: { path: "country" } },
  { path: "city", populate: [{ path: "country" }, { path: "state", populate: { path: "country" } }] },
];
