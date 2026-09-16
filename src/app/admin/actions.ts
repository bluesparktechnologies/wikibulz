"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { requireRole, requireUser } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/session";
import { connectMongo } from "@/lib/db/mongoose";
import { buildPostUrl, normalizeSlug } from "@/lib/seo/url";
import { canonicalUrlSchema, categoryFormSchema } from "@/lib/validation/content";
import { AuthorModel, CategoryModel, PageModel, PostModel, RedirectModel, SeoRevisionModel, TagModel, UserModel } from "@/models/schemas";
import type { UserRole } from "@/types/content";

export type AdminEntity = { id: string; name: string; slug: string };
export type AdminActionState = { ok: boolean; message: string; entity?: AdminEntity };

const initialError = (message: string): AdminActionState => ({ ok: false, message });
const val = (formData: FormData, key: string) => formData.get(key)?.toString() ?? "";
const csv = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

const categoryFieldLabels: Record<string, string> = {
  name: "Category name",
  slug: "Category slug",
  description: "Category description",
  parentCategory: "Parent category",
  seoTitle: "SEO title",
  metaDescription: "Meta description",
  canonicalUrl: "Canonical URL",
};

function categoryValidationMessage(error: z.ZodError) {
  const issue = error.issues[0];
  if (!issue) return "Check the category fields and try again.";
  const field = typeof issue.path[0] === "string" ? categoryFieldLabels[issue.path[0]] ?? issue.path[0] : "";
  if (field === "Category name") return "Enter a category name with at least 2 characters.";
  if (field === "Category slug") return "Enter a category slug with at least 2 characters.";
  if (field === "Category description") return "Enter a category description with at least 30 characters.";
  return field ? `${field}: ${issue.message}` : issue.message;
}

async function ensureDb() {
  const db = await connectMongo();
  if (!db) throw new Error("MongoDB is not configured.");
  return db;
}

type CategoryPathRecord = { id: string; slug: string; parentCategory?: string };

function categoryPathFromRecords(id: string, records: Map<string, CategoryPathRecord>) {
  const path: string[] = [];
  const seen = new Set<string>();
  let current = id;
  while (current && !seen.has(current)) {
    const record = records.get(current);
    if (!record) break;
    seen.add(current);
    path.unshift(record.slug);
    current = record.parentCategory ?? "";
  }
  return path;
}

async function preserveCategoryUrlChanges(categoryId: string, beforeDocs: Array<{ _id: unknown; slug: string; parentCategory?: unknown }>, nextSlug: string, nextParentCategory?: string) {
  const before = new Map<string, CategoryPathRecord>(beforeDocs.map((doc) => [String(doc._id), { id: String(doc._id), slug: doc.slug, parentCategory: doc.parentCategory ? String(doc.parentCategory) : undefined }]));
  const after = new Map(Array.from(before.entries()).map(([id, record]) => [id, { ...record }]));
  const target = after.get(categoryId);
  if (!target) return;
  target.slug = nextSlug;
  target.parentCategory = nextParentCategory || undefined;

  const changedCategoryIds = Array.from(before.keys()).filter((id) => categoryPathFromRecords(id, before).join("/") !== categoryPathFromRecords(id, after).join("/"));
  if (!changedCategoryIds.length) return;

  const previousTarget = before.get(categoryId);
  if (previousTarget && previousTarget.slug !== nextSlug) {
    await RedirectModel.updateOne(
      { sourcePath: `/category/${previousTarget.slug}` },
      { sourcePath: `/category/${previousTarget.slug}`, destinationPath: `/category/${nextSlug}`, statusCode: 301, active: true },
      { upsert: true },
    );
  }

  const posts = await PostModel.find({ category: { $in: changedCategoryIds }, status: "published", robotsIndex: true }).select("slug publicId category").lean();
  await Promise.all(posts.map(async (post) => {
    const postCategoryId = String(post.category);
    const oldPath = categoryPathFromRecords(postCategoryId, before);
    const newPath = categoryPathFromRecords(postCategoryId, after);
    if (!oldPath.length || !newPath.length || oldPath.join("/") === newPath.join("/")) return;
    const oldUrl = buildPostUrl({ slug: String(post.slug), publicId: typeof post.publicId === "string" ? post.publicId : undefined, category: { slug: oldPath[oldPath.length - 1], categoryPath: oldPath } });
    const newUrl = buildPostUrl({ slug: String(post.slug), publicId: typeof post.publicId === "string" ? post.publicId : undefined, category: { slug: newPath[newPath.length - 1], categoryPath: newPath } });
    await RedirectModel.updateOne(
      { sourcePath: oldUrl },
      { sourcePath: oldUrl, destinationPath: newUrl, statusCode: 301, active: true },
      { upsert: true },
    );
  }));
}

export async function saveCategoryAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireRole("editor");
  try {
    await ensureDb();
    const categoryId = val(formData, "categoryId");
    if (categoryId && !isValidObjectId(categoryId)) return initialError("Category could not be found.");
    const parsed = categoryFormSchema.parse({
      name: val(formData, "name"),
      slug: val(formData, "slug"),
      description: val(formData, "description"),
      parentCategory: val(formData, "parentCategory"),
      seoTitle: val(formData, "seoTitle"),
      metaDescription: val(formData, "metaDescription"),
      canonicalUrl: val(formData, "canonicalUrl"),
      indexStatus: val(formData, "indexStatus") || "index",
    });
    const existing = categoryId
      ? await CategoryModel.findById(categoryId).lean()
      : await CategoryModel.findOne({ slug: parsed.slug }).lean();
    if (categoryId && !existing) return initialError("Category could not be found.");
    if (formData.get("createOnly") === "true" && existing) return initialError("A category with this slug already exists.");
    const slugConflict = await CategoryModel.findOne({ slug: parsed.slug, ...(categoryId ? { _id: { $ne: categoryId } } : {}) }).select("_id").lean();
    if (slugConflict) return initialError("A category with this slug already exists.");
    const parentCategoryId = parsed.parentCategory;
    if (parentCategoryId && !isValidObjectId(parentCategoryId)) return initialError("Select a valid parent category.");
    if (parentCategoryId && categoryId === parentCategoryId) return initialError("A category cannot be its own parent.");
    if (parentCategoryId) {
      const parent = await CategoryModel.findById(parentCategoryId).select("_id parentCategory").lean();
      if (!parent) return initialError("The selected parent category could not be found.");
      if (categoryId) {
        let cursor: unknown = parent.parentCategory;
        for (let depth = 0; depth < 100 && cursor; depth += 1) {
          if (String(cursor) === categoryId) return initialError("A category cannot be placed below one of its own descendants.");
          const ancestor = await CategoryModel.findById(cursor).select("parentCategory").lean();
          cursor = ancestor?.parentCategory;
        }
      }
    }
    const oldParentCategoryId = existing?.parentCategory ? String(existing.parentCategory) : "";
    const pathWillChange = Boolean(categoryId && existing && (existing.slug !== parsed.slug || oldParentCategoryId !== (parentCategoryId || "")));
    const categoryPathDocs = pathWillChange
      ? await CategoryModel.find({}).select("_id slug parentCategory").lean()
      : [];
    const categoryData = { ...parsed, parentCategory: parentCategoryId || undefined };
    const category = categoryId
      ? await CategoryModel.findByIdAndUpdate(categoryId, categoryData, { new: true, runValidators: true }).lean()
      : await CategoryModel.findOneAndUpdate({ slug: parsed.slug }, categoryData, { upsert: true, new: true, runValidators: true }).lean();
    if (!category) return initialError("Category could not be found.");
    if (pathWillChange && categoryId) await preserveCategoryUrlChanges(categoryId, categoryPathDocs, parsed.slug, parentCategoryId);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/posts");
    revalidatePath("/admin/posts/new");
    revalidatePath(`/category/${parsed.slug}`);
    revalidatePath("/sitemap-categories.xml");
    revalidatePath("/sitemap.xml");
    return { ok: true, message: "Category saved.", entity: { id: String(category._id), name: category.name, slug: category.slug } };
  } catch (error) {
    if (error instanceof z.ZodError) return initialError(categoryValidationMessage(error));
    return initialError(error instanceof Error ? error.message : "Category save failed.");
  }
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireRole("editor");
  const id = val(formData, "id");
  try {
    await ensureDb();
    if (!isValidObjectId(id)) redirect(`/admin/categories?error=${encodeURIComponent("Category could not be found.")}`);
    const category = await CategoryModel.findById(id).lean();
    if (!category) redirect(`/admin/categories?error=${encodeURIComponent("Category could not be found.")}`);
    const [linkedPosts, childCategories] = await Promise.all([
      PostModel.countDocuments({ category: id }),
      CategoryModel.countDocuments({ parentCategory: id }),
    ]);
    if (linkedPosts > 0) redirect(`/admin/categories?error=${encodeURIComponent(`This category has ${linkedPosts} linked post${linkedPosts === 1 ? "" : "s"}. Reassign the posts before deleting it.`)}`);
    if (childCategories > 0) redirect(`/admin/categories?error=${encodeURIComponent(`This category has ${childCategories} child categor${childCategories === 1 ? "y" : "ies"}. Move or delete the child categories before deleting it.`)}`);
    await CategoryModel.findByIdAndDelete(id);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/posts/new");
    revalidatePath("/sitemap-categories.xml");
    revalidatePath(`/category/${category.slug}`);
    redirect("/admin/categories?message=Category%20deleted.");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
    redirect(`/admin/categories?error=${encodeURIComponent(error instanceof Error ? error.message : "Category deletion failed.")}`);
  }
}

export async function saveTagAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireRole("editor");
  try {
    await ensureDb();
    const name = val(formData, "name");
    const slug = normalizeSlug(val(formData, "slug") || name);
    await TagModel.updateOne({ slug }, { name, slug, description: val(formData, "description"), indexStatus: val(formData, "indexStatus") || "noindex" }, { upsert: true, runValidators: true });
    revalidatePath("/admin/tags");
    return { ok: true, message: "Tag saved." };
  } catch (error) {
    return initialError(error instanceof Error ? error.message : "Tag save failed.");
  }
}

export async function saveAuthorAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireRole("editor");
  try {
    await ensureDb();
    const authorId = val(formData, "authorId");
    const name = val(formData, "name");
    const slug = normalizeSlug(val(formData, "slug") || name);
    const existing = authorId ? await AuthorModel.findById(authorId).lean() : await AuthorModel.findOne({ slug }).lean();
    if (formData.get("createOnly") === "true" && existing) return initialError("An author with this slug already exists.");
    const author = await AuthorModel.findOneAndUpdate(
      authorId ? { _id: authorId } : { slug },
      {
        name,
        slug,
        email: val(formData, "email"),
        bio: val(formData, "bio"),
        jobTitle: val(formData, "jobTitle"),
        expertise: csv(val(formData, "expertise")),
        credentials: csv(val(formData, "credentials")),
        socialLinks: csv(val(formData, "socialLinks")),
        website: val(formData, "website"),
        status: val(formData, "status") || "active",
      },
      { upsert: true, new: true, runValidators: true },
    ).lean();
    revalidatePath("/admin/authors");
    revalidatePath("/admin/posts");
    revalidatePath("/admin/posts/new");
    revalidatePath(`/author/${slug}`);
    if (existing?.slug && existing.slug !== slug) revalidatePath(`/author/${existing.slug}`);
    return { ok: true, message: "Author saved.", entity: author ? { id: String(author._id), name: author.name, slug: author.slug } : undefined };
  } catch (error) {
    return initialError(error instanceof Error ? error.message : "Author save failed.");
  }
}

export async function deleteAuthorAction(formData: FormData): Promise<void> {
  await requireRole("editor");
  const id = val(formData, "id");
  try {
    await ensureDb();
    const linkedPosts = await PostModel.countDocuments({ $or: [{ author: id }, { reviewer: id }, { factCheckedBy: id }] });
    if (linkedPosts > 0) redirect(`/admin/authors?error=${encodeURIComponent("This author is linked to posts. Mark it inactive instead of deleting it.")}`);
    await AuthorModel.findByIdAndDelete(id);
    revalidatePath("/admin/authors");
    redirect("/admin/authors?message=Author%20deleted.");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
    redirect(`/admin/authors?error=${encodeURIComponent(error instanceof Error ? error.message : "Author deletion failed.")}`);
  }
}

export async function savePageAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireRole("editor");
  try {
    await ensureDb();
    const title = val(formData, "title");
    const slug = normalizeSlug(val(formData, "slug") || title);
    await PageModel.updateOne(
      { slug },
      {
        title,
        slug,
        excerpt: val(formData, "excerpt"),
        content: val(formData, "content"),
        seoTitle: val(formData, "seoTitle"),
        metaDescription: val(formData, "metaDescription"),
        canonicalUrl: canonicalUrlSchema.parse(val(formData, "canonicalUrl")),
        robotsIndex: formData.has("robotsIndex"),
        robotsFollow: formData.has("robotsFollow"),
      },
      { upsert: true, runValidators: true },
    );
    revalidatePath("/admin/pages");
    revalidatePath(`/${slug}`);
    return { ok: true, message: "Page saved." };
  } catch (error) {
    return initialError(error instanceof Error ? error.message : "Page save failed.");
  }
}

export async function saveUserAction(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireRole("admin");
  try {
    await ensureDb();
    const email = val(formData, "email").toLowerCase();
    const password = val(formData, "password");
    const role = (val(formData, "role") || "author") as UserRole;
    const update: { name: string; email: string; role: UserRole; active: boolean; passwordHash?: string } = {
      name: val(formData, "name"),
      email,
      role,
      active: formData.has("active"),
    };
    if (password) update.passwordHash = await hashPassword(password);
    await UserModel.updateOne({ email }, update, { upsert: true, runValidators: true });
    revalidatePath("/admin/users");
    return { ok: true, message: "User saved." };
  } catch (error) {
    return initialError(error instanceof Error ? error.message : "User save failed.");
  }
}

export async function recordSeoRevision(entityType: string, entityId: string, field: string, previousValue: string, nextValue: string) {
  const user = await requireUser();
  const db = await connectMongo();
  if (!db || previousValue === nextValue) return;
  await SeoRevisionModel.create({ entityType, entityId, field, previousValue, nextValue, changedBy: user.email });
}
