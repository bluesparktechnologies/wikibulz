"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { findRootSlugConflict } from "@/lib/admin/root-slug-conflicts";
import { connectMongo } from "@/lib/db/mongoose";
import { calculateReadingMinutes, calculateWordCount, ensureHeadingIds, generateTableOfContents } from "@/lib/content/processing";
import { sanitizeArticleHtml } from "@/lib/seo/analysis";
import { buildPostUrl, normalizeSlug } from "@/lib/seo/url";
import { structuredRawValues } from "@/lib/admin/structured-fields";
import { postFormSchema } from "@/lib/validation/content";
import { invalidatePost } from "@/lib/cache/invalidation";
import { InternalLinkModel, MediaAssetModel, PostModel, RedirectModel, TagModel, postCategoryPopulate, postLocationPopulate } from "@/models/schemas";
import { PublishingQueueModel, RefreshCandidateModel } from "@/modules/autoblog/models/schemas";
import { getPostById } from "@/repositories/content.repository";
import { mapPost } from "@/repositories/mappers";
import { getStorageAdapter, validateImageUpload } from "@/services/media";

export type PostActionState = { ok: boolean; message: string };

const postFieldLabels: Record<string, string> = {
  title: "Title",
  slug: "Slug",
  excerpt: "Excerpt",
  content: "Article body",
  author: "Author",
  category: "Category",
  status: "Status",
  canonicalUrl: "Canonical URL",
  featuredImageUrl: "Featured image URL",
  seoTitle: "SEO title",
  metaDescription: "Meta description",
};

function postValidationMessage(error: z.ZodError) {
  const issue = error.issues[0];
  if (!issue) return "Check the highlighted post fields.";
  const field = typeof issue.path[0] === "string" ? postFieldLabels[issue.path[0]] ?? issue.path[0] : "";
  return field ? `${field}: ${issue.message}` : issue.message;
}

function postSaveError(error: unknown) {
  if (error && typeof error === "object" && "code" in error && error.code === 11000) {
    return "A post with this slug already exists. Change the slug and try again.";
  }
  if (error instanceof Error && /validation failed/i.test(error.message)) {
    return "Post data is invalid. Check the required fields and try again.";
  }
  return "Post could not be saved because the database request failed. Please try again.";
}

const formValue = (formData: FormData, key: string) => formData.get(key)?.toString() ?? "";

function parsePostForm(formData: FormData) {
  const structured = structuredRawValues(formData);
  return postFormSchema.parse({
    title: formValue(formData, "title"),
    slug: formValue(formData, "slug"),
    excerpt: formValue(formData, "excerpt"),
    content: formValue(formData, "content"),
    featuredImageUrl: formValue(formData, "featuredImageUrl"),
    featuredImageAlt: formValue(formData, "featuredImageAlt"),
    author: formValue(formData, "author"),
    country: formValue(formData, "country"),
    state: formValue(formData, "state"),
    city: formValue(formData, "city"),
    category: formValue(formData, "category"),
    status: formValue(formData, "status") || "draft",
    publishedAt: formValue(formData, "publishedAt"),
    scheduledAt: formValue(formData, "scheduledAt"),
    seoTitle: formValue(formData, "seoTitle"),
    metaDescription: formValue(formData, "metaDescription"),
    canonicalUrl: formValue(formData, "canonicalUrl"),
    ogTitle: formValue(formData, "ogTitle"),
    ogDescription: formValue(formData, "ogDescription"),
    ogImageUrl: formValue(formData, "ogImageUrl"),
    ogImageAlt: formValue(formData, "ogImageAlt"),
    twitterTitle: formValue(formData, "twitterTitle"),
    twitterDescription: formValue(formData, "twitterDescription"),
    twitterImageUrl: formValue(formData, "twitterImageUrl"),
    twitterImageAlt: formValue(formData, "twitterImageAlt"),
    robotsIndex: formData.has("robotsIndex"),
    robotsFollow: formData.has("robotsFollow"),
    focusKeyword: formValue(formData, "focusKeyword"),
    secondaryKeywords: formValue(formData, "secondaryKeywords"),
    newTags: formValue(formData, "newTags"),
    schemaType: formValue(formData, "schemaType") || "BlogPosting",
    reviewer: formValue(formData, "reviewer"),
    factCheckedBy: formValue(formData, "factCheckedBy"),
    reviewedBy: formValue(formData, "reviewedBy"),
    lastReviewedAt: formValue(formData, "lastReviewedAt"),
    sourcesRaw: structured.sourcesRaw,
    referencesRaw: structured.referencesRaw,
    faqsRaw: structured.faqsRaw,
    featured: formData.has("featured"),
    editorPick: formData.has("editorPick"),
  });
}

function parseSourceLines(value?: string) {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", url = "", publisher = "", dateAccessed = ""] = line.split("|").map((item) => item.trim());
      return { title, url, publisher: publisher || undefined, dateAccessed: dateAccessed || undefined };
    })
    .filter((item) => item.title.length >= 2 && /^https?:\/\//.test(item.url));
}

function parseFaqLines(value?: string) {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question = "", answer = ""] = line.split("|").map((item) => item.trim());
      return { question, answer };
    })
    .filter((item) => item.question.length >= 5 && item.answer.length >= 10);
}

function mediaFromUrl(url: string | undefined, alt: string | undefined, fallback: { url: string; alt: string; width: number; height: number }) {
  if (!url) return null;
  return { url, alt: alt || fallback.alt, width: fallback.width, height: fallback.height };
}

async function storeFeaturedImage(formData: FormData, fallbackAlt: string) {
  const file = formData.get("featuredImageFile");
  if (!(file instanceof File) || file.size === 0) return null;
  const validationError = validateImageUpload({ type: file.type, size: file.size });
  if (validationError) throw new Error(validationError);
  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9.-]/gi, "-").toLowerCase();
  const key = `${Date.now()}-${baseName || "featured-image"}.webp`;
  const input = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(input, { failOn: "none" }).metadata();
  const targetWidth = metadata.width && metadata.width > 2400 ? 2400 : undefined;
  const { data, info } = await sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  const stored = await getStorageAdapter().putBuffer(data, key, "image/webp");
  const asset = {
    url: stored.url,
    alt: formValue(formData, "featuredImageAlt").trim() || fallbackAlt,
    width: info.width,
    height: info.height,
    fileSize: data.length,
    mimeType: "image/webp",
    provider: stored.provider,
    usageReferences: [],
  };
  await MediaAssetModel.updateOne({ url: asset.url }, asset, { upsert: true });
  return asset;
}

async function resolveTagIds(selectedTags: string[], newTagNames: string[]) {
  const tagIds = new Set(selectedTags.filter(Boolean));
  for (const name of newTagNames) {
    const slug = normalizeSlug(name);
    if (!slug) continue;
    const tag = await TagModel.findOneAndUpdate(
      { slug },
      { name, slug, indexStatus: "noindex" },
      { upsert: true, returnDocument: "after" },
    );
    tagIds.add(String(tag._id));
  }
  return Array.from(tagIds);
}

export async function savePostAction(_state: PostActionState, formData: FormData): Promise<PostActionState> {
  await requireUser();
  const db = await connectMongo();
  if (!db) return { ok: false, message: "MongoDB is not configured. Add MONGODB_URI before saving production content." };

  const id = formValue(formData, "id");
  let parsed: ReturnType<typeof parsePostForm>;
  try {
    parsed = parsePostForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return { ok: false, message: postValidationMessage(error) };
    return { ok: false, message: "Post fields could not be validated." };
  }
  if (!isValidObjectId(parsed.author)) return { ok: false, message: "Author: select a valid active author." };
  if (!isValidObjectId(parsed.category)) return { ok: false, message: "Category: select a valid category." };
  if (parsed.country && !isValidObjectId(parsed.country)) return { ok: false, message: "Country: select a valid country." };
  if (parsed.state && !isValidObjectId(parsed.state)) return { ok: false, message: "State: select a valid state." };
  if (parsed.city && !isValidObjectId(parsed.city)) return { ok: false, message: "City: select a valid city." };
  const rootConflict = await findRootSlugConflict(parsed.slug, "post", id || undefined);
  if (rootConflict) return { ok: false, message: rootConflict };
  const safeContent = ensureHeadingIds(sanitizeArticleHtml(parsed.content, { articleBody: true }));
  let previous: Awaited<ReturnType<typeof getPostById>> = null;
  let uploadedImage: Awaited<ReturnType<typeof storeFeaturedImage>> = null;
  try {
    uploadedImage = await storeFeaturedImage(formData, parsed.title);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Featured image could not be uploaded." };
  }
  try {
    previous = id ? await getPostById(id) : null;
  } catch (error) {
    return { ok: false, message: postSaveError(error) };
  }
  const featuredImageUrl = uploadedImage?.url ?? parsed.featuredImageUrl ?? previous?.featuredImage.url;
  if (!featuredImageUrl) return { ok: false, message: "Add a featured image URL or upload a featured image." };
  const featuredImageAlt = uploadedImage?.alt ?? parsed.featuredImageAlt ?? previous?.featuredImage.alt ?? parsed.title;
  let savedDoc: Record<string, unknown> | null = null;
  try {
    const tagIds = await resolveTagIds(formData.getAll("tags").map((item) => item.toString()), parsed.newTags);
  const payload = {
    title: parsed.title,
    slug: parsed.slug,
    // Keep the immutable legacy identifier when an older post is edited, but
    // do not create one for new posts. New public URLs use the editorial slug.
    publicId: previous?.publicId,
    excerpt: parsed.excerpt,
    content: safeContent,
    featuredImage: {
      url: featuredImageUrl,
      alt: featuredImageAlt,
      width: uploadedImage?.width ?? previous?.featuredImage.width ?? 1600,
      height: uploadedImage?.height ?? previous?.featuredImage.height ?? 900,
    },
    author: parsed.author,
    country: parsed.country ?? null,
    state: parsed.state ?? null,
    city: parsed.city ?? null,
    category: parsed.category,
    tags: tagIds,
    status: parsed.status,
    publishedAt: parsed.status === "published" ? parsed.publishedAt || previous?.publishedAt || new Date().toISOString() : parsed.publishedAt,
    scheduledAt: parsed.scheduledAt ?? null,
    seoTitle: parsed.seoTitle,
    metaDescription: parsed.metaDescription,
    canonicalUrl: parsed.canonicalUrl,
    ogTitle: parsed.ogTitle,
    ogDescription: parsed.ogDescription,
    ogImage: mediaFromUrl(parsed.ogImageUrl, parsed.ogImageAlt, { url: featuredImageUrl, alt: featuredImageAlt, width: uploadedImage?.width ?? previous?.featuredImage.width ?? 1600, height: uploadedImage?.height ?? previous?.featuredImage.height ?? 900 }),
    twitterTitle: parsed.twitterTitle,
    twitterDescription: parsed.twitterDescription,
    twitterImage: mediaFromUrl(parsed.twitterImageUrl, parsed.twitterImageAlt, { url: featuredImageUrl, alt: featuredImageAlt, width: uploadedImage?.width ?? previous?.featuredImage.width ?? 1600, height: uploadedImage?.height ?? previous?.featuredImage.height ?? 900 }),
    robotsIndex: parsed.robotsIndex,
    robotsFollow: parsed.robotsFollow,
    focusKeyword: parsed.focusKeyword,
    secondaryKeywords: parsed.secondaryKeywords,
    schemaType: parsed.schemaType,
    reviewer: parsed.reviewer ?? null,
    factCheckedBy: parsed.factCheckedBy ?? null,
    reviewedBy: parsed.reviewedBy,
    lastReviewedAt: parsed.lastReviewedAt ?? null,
    sources: parseSourceLines(parsed.sourcesRaw),
    references: parseSourceLines(parsed.referencesRaw),
    faqs: parseFaqLines(parsed.faqsRaw),
    featured: parsed.featured,
    editorPick: parsed.editorPick,
    readingTime: calculateReadingMinutes(safeContent),
    wordCount: calculateWordCount(safeContent),
    tableOfContents: generateTableOfContents(safeContent),
  };

    savedDoc = id
      ? await PostModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
        .populate("author reviewer factCheckedBy tags")
        .populate(postCategoryPopulate)
        .populate(postLocationPopulate)
        .lean()
      : await PostModel.create(payload).then((doc) =>
        PostModel.findById(doc._id).populate("author reviewer factCheckedBy tags").populate(postCategoryPopulate).populate(postLocationPopulate).lean(),
      );
  } catch (error) {
    return { ok: false, message: postSaveError(error) };
  }

  if (!savedDoc) return { ok: false, message: "Post was not found." };
  const savedPost = mapPost(JSON.parse(JSON.stringify(savedDoc)));

  if (previous && previous.status === "published") {
    const oldPath = buildPostUrl(previous);
    const newPath = buildPostUrl(savedPost);
    if (oldPath !== newPath) {
      await RedirectModel.updateOne(
        { sourcePath: oldPath },
        { sourcePath: oldPath, destinationPath: newPath, statusCode: 301, active: true },
        { upsert: true },
      );
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/posts");
  revalidatePath(buildPostUrl(savedPost));
  redirect(`/admin/posts/${savedPost.id}`);
}

export async function publishPostAction(formData: FormData) {
  await requireUser();
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is not configured.");
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Post id is required.");
  const doc = await PostModel.findByIdAndUpdate(
    id,
    { $set: { status: "published", publishedAt: new Date(), scheduledAt: null, robotsIndex: true, robotsFollow: true } },
    { returnDocument: "after", runValidators: true },
  ).populate("author reviewer factCheckedBy tags").populate(postCategoryPopulate).populate(postLocationPopulate).lean();
  if (!doc) throw new Error("Post not found.");
  const post = mapPost(JSON.parse(JSON.stringify(doc)));
  revalidatePath("/");
  revalidatePath("/admin/posts");
  revalidatePath(buildPostUrl(post));
  redirect(`/admin/posts/${post.id}`);
}

export async function movePostToTrashAction(formData: FormData) {
  await requireUser();
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is not configured.");
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Post id is required.");
  const doc = await PostModel.findByIdAndUpdate(
    id,
    { $set: { status: "trash", robotsIndex: false, robotsFollow: false, scheduledAt: null } },
    { new: true, runValidators: true },
  ).populate("author reviewer factCheckedBy tags").populate(postCategoryPopulate).populate(postLocationPopulate).lean();
  if (!doc) throw new Error("Post not found.");
  await invalidatePost(mapPost(JSON.parse(JSON.stringify(doc))));
  revalidatePath("/");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function restorePostFromTrashAction(formData: FormData) {
  await requireUser();
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is not configured.");
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Post id is required.");
  const doc = await PostModel.findOneAndUpdate(
    { _id: id, status: "trash" },
    { $set: { status: "draft", publishedAt: null, scheduledAt: null, robotsIndex: false, robotsFollow: true } },
    { new: true, runValidators: true },
  ).populate("author reviewer factCheckedBy tags").populate(postCategoryPopulate).populate(postLocationPopulate).lean();
  if (!doc) throw new Error("Trashed post not found.");
  await invalidatePost(mapPost(JSON.parse(JSON.stringify(doc))));
  revalidatePath("/admin/posts");
  revalidatePath("/admin/posts/trash");
  redirect("/admin/posts/trash?message=Post%20restored%20as%20a%20draft.");
}

export async function permanentlyDeletePostAction(formData: FormData) {
  await requireUser();
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is not configured.");
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Post id is required.");
  const doc = await PostModel.findOne({ _id: id, status: "trash" }).populate("author reviewer factCheckedBy tags").populate(postCategoryPopulate).populate(postLocationPopulate).lean();
  if (!doc) throw new Error("Only posts in Trash can be permanently deleted.");
  const post = mapPost(JSON.parse(JSON.stringify(doc)));
  const postId = doc._id;
  await Promise.all([
    PostModel.updateMany({}, { $pull: { relatedPosts: postId, manualInternalLinks: postId } }),
    InternalLinkModel.deleteMany({ $or: [{ sourcePost: postId }, { targetPost: postId }] }),
    PublishingQueueModel.deleteMany({ postId }),
    RefreshCandidateModel.deleteMany({ postId }),
    PostModel.deleteOne({ _id: postId, status: "trash" }),
  ]);
  await invalidatePost(post);
  revalidatePath("/admin/posts");
  revalidatePath("/admin/posts/trash");
  redirect("/admin/posts/trash?message=Post%20permanently%20deleted.");
}
