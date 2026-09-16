"use client";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AdminMedia } from "@/repositories/admin.repository";
import type { Author, Category, Post, Tag } from "@/types/content";
import { savePostAction, type PostActionState } from "@/app/admin/posts/actions";
import { saveAuthorAction, saveCategoryAction, type AdminEntity } from "@/app/admin/actions";
import { normalizeCategorySlug } from "@/lib/seo/category-slug";
import { normalizePostSlug } from "@/lib/seo/post-slug";
import { FeaturedImageFields } from "@/components/admin/featured-image-fields";
import { RichEditor } from "@/components/admin/rich-editor";
import { StructuredSeoFields } from "@/components/admin/structured-seo-fields";

const schema = z.object({
  title: z.string().min(5),
  slug: z.string().min(3),
  excerpt: z.string().min(20),
  seoTitle: z.string().max(65).optional(),
  metaDescription: z.string().max(170).optional(),
  robotsIndex: z.boolean(),
  robotsFollow: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const initialState: PostActionState = { ok: false, message: "" };
const dateTimeValue = (value?: string) => value ? value.slice(0, 16) : "";
const toSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 160);
const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const countMatches = (value: string, pattern: RegExp) => Array.from(value.matchAll(pattern)).length;
const newPostDraftKey = "it-news-week:new-post-draft:v1";

type SavedPostDraft = { content: string; fields: Record<string, string[]>; checks: Record<string, boolean> };

function readSavedPostDraft(): SavedPostDraft | null {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(newPostDraftKey) ?? "null");
    if (!value || typeof value !== "object") return null;
    const draft = value as Partial<SavedPostDraft>;
    if (typeof draft.content !== "string" || !draft.fields || !draft.checks) return null;
    return { content: draft.content, fields: draft.fields, checks: draft.checks };
  } catch { return null; }
}

function SeoHint({ label, value, ideal, limit }: { label: string; value: string; ideal: string; limit: number }) {
  const length = value.length;
  const tone = length === 0 ? "text-[#617269]" : length > limit ? "text-red-700" : "text-green-700";
  return <p className={`text-xs font-bold ${tone}`}>{label}: {length}/{limit} · {ideal}</p>;
}

type EntityKind = "author" | "category";
type EntityCreatorProps = { kind: EntityKind; onCancel: () => void; onCreated: (entity: AdminEntity) => void };

function EntityCreator({ kind, onCancel, onCreated }: EntityCreatorProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const isAuthor = kind === "author";
  const label = isAuthor ? "author" : "category";

  function createEntity() {
    const nextSlug = isAuthor ? toSlug(slug || name) : normalizeCategorySlug(slug || name);
    if (!name.trim() || !nextSlug) { setMessage(`Enter a ${label} name.`); return; }
    if (isAuthor && !email.trim()) { setMessage("Enter the author email."); return; }
    if (!isAuthor && description.trim().length < 30) { setMessage("Category description must be at least 30 characters."); return; }

    const formData = new FormData();
    formData.set("createOnly", "true");
    formData.set("name", name.trim());
    formData.set("slug", nextSlug);
    if (isAuthor) {
      formData.set("email", email.trim());
      formData.set("bio", bio.trim());
      formData.set("jobTitle", "");
      formData.set("expertise", "");
      formData.set("credentials", "");
      formData.set("socialLinks", "");
      formData.set("website", "");
      formData.set("status", "active");
    } else {
      formData.set("description", description.trim());
      formData.set("seoTitle", "");
      formData.set("metaDescription", "");
      formData.set("canonicalUrl", "");
      formData.set("indexStatus", "index");
    }

    startTransition(async () => {
      const state = isAuthor ? await saveAuthorAction({ ok: false, message: "" }, formData) : await saveCategoryAction({ ok: false, message: "" }, formData);
      if (!state.ok || !state.entity) { setMessage(state.message || `Could not create ${label}.`); return; }
      onCreated(state.entity);
      onCancel();
    });
  }

  return <div className="grid gap-3 rounded-lg border border-dashed border-[var(--brand)] bg-[#eef5f1] p-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-black">New {isAuthor ? "Author" : "Category"}</p><button type="button" onClick={onCancel} className="text-xs font-bold text-[var(--brand)]">Cancel</button></div>
    <div className="grid gap-3 md:grid-cols-2"><input value={name} onChange={(event) => setName(event.target.value)} placeholder={`${isAuthor ? "Author" : "Category"} name`} className="rounded border border-[var(--line)] bg-white px-3 py-2" /><input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="Slug (auto-generated if blank)" className="rounded border border-[var(--line)] bg-white px-3 py-2" /></div>
    {isAuthor ? <><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Author email" className="rounded border border-[var(--line)] bg-white px-3 py-2" /><textarea value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Short bio (optional)" className="min-h-20 rounded border border-[var(--line)] bg-white px-3 py-2" /></> : <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Category description (at least 30 characters)" className="min-h-20 rounded border border-[var(--line)] bg-white px-3 py-2" />}
    {message ? <p className="text-sm font-bold text-red-700" role="status">{message}</p> : null}
    <button type="button" disabled={pending} onClick={createEntity} className="w-fit rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{pending ? "Creating..." : `Create ${isAuthor ? "Author" : "Category"}`}</button>
  </div>;
}

export function PostEditor({ authors, categories, tags, media, post }: { authors: Author[]; categories: Category[]; tags: Tag[]; media: AdminMedia[]; post?: Post }) {
  const [state, action, pending] = useActionState(savePostAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [availableAuthors, setAvailableAuthors] = useState<Array<Pick<Author, "id" | "name" | "slug">>>(authors);
  const [availableCategories, setAvailableCategories] = useState<Array<Pick<Category, "id" | "name" | "slug">>>(categories);
  const [selectedAuthor, setSelectedAuthor] = useState(post?.author.id ?? authors[0]?.id ?? "");
  const [selectedCategory, setSelectedCategory] = useState(post?.category.id ?? categories[0]?.id ?? "");
  const [creatingEntity, setCreatingEntity] = useState<EntityKind | null>(null);
  const [contentHtml, setContentHtml] = useState(post?.content ?? "");
  const [draftReady, setDraftReady] = useState(Boolean(post));
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const { register, formState, control, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      seoTitle: post?.seoTitle ?? "",
      metaDescription: post?.metaDescription ?? "",
      robotsIndex: post?.robotsIndex ?? true,
      robotsFollow: post?.robotsFollow ?? true,
    },
  });
  const watchedTitle = useWatch({ control, name: "title" }) ?? "";
  const watchedSlug = useWatch({ control, name: "slug" }) ?? "";
  const watchedSeoTitle = useWatch({ control, name: "seoTitle" }) ?? "";
  const watchedExcerpt = useWatch({ control, name: "excerpt" }) ?? "";
  const watchedMeta = useWatch({ control, name: "metaDescription" }) ?? "";
  const previewTitle = watchedSeoTitle || watchedTitle || "SEO title preview";
  const previewDescription = watchedMeta || watchedExcerpt || "Meta description preview";
  const selectedCategorySlug = useMemo(() => availableCategories.find((category) => category.id === selectedCategory)?.slug ?? availableCategories[0]?.slug ?? "category", [availableCategories, selectedCategory]);
  const slugField = register("slug");
  const contentStats = useMemo(() => {
    const words = stripHtml(contentHtml).split(" ").filter(Boolean).length;
    const h2Count = countMatches(contentHtml, /<h2\b/gi);
    const bodyImages = countMatches(contentHtml, /<img\b/gi);
    const imagesMissingAlt = countMatches(contentHtml, /<img(?![^>]*alt=["'][^"']+["'])/gi);
    const internalLinks = countMatches(contentHtml, /<a[^>]+href=["']\//gi);
    const externalLinks = countMatches(contentHtml, /<a[^>]+href=["']https?:\/\//gi);
    return { words, h2Count, bodyImages, imagesMissingAlt, internalLinks, externalLinks };
  }, [contentHtml]);

  useEffect(() => {
    if (!slugTouched && watchedTitle) setValue("slug", normalizePostSlug(watchedTitle));
  }, [slugTouched, setValue, watchedTitle]);

  const saveDraft = useCallback(() => {
    if (post || !draftReady || !formRef.current) return;
    const fields: Record<string, string[]> = {};
    for (const [key, value] of new FormData(formRef.current).entries()) {
      if (key === "content" || typeof value !== "string") continue;
      fields[key] = [...(fields[key] ?? []), value];
    }
    const checks = Object.fromEntries(Array.from(formRef.current.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name]')).map((input) => [input.name, input.checked]));
    try {
      window.localStorage.setItem(newPostDraftKey, JSON.stringify({ content: contentHtml, fields, checks } satisfies SavedPostDraft));
    } catch { /* Local storage can be unavailable in private browser contexts. */ }
  }, [contentHtml, draftReady, post]);

  const handleDraftInput = useCallback(() => {
    if (post || !draftReady) return;
    saveDraft();
    setHasLocalDraft(true);
  }, [draftReady, post, saveDraft]);

  const handleContentChange = useCallback((nextHtml: string) => {
    setContentHtml(nextHtml);
    if (post || !draftReady || !formRef.current) return;
    const fields: Record<string, string[]> = {};
    for (const [key, value] of new FormData(formRef.current).entries()) {
      if (key === "content" || typeof value !== "string") continue;
      fields[key] = [...(fields[key] ?? []), value];
    }
    const checks = Object.fromEntries(Array.from(formRef.current.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name]')).map((input) => [input.name, input.checked]));
    try {
      window.localStorage.setItem(newPostDraftKey, JSON.stringify({ content: nextHtml, fields, checks } satisfies SavedPostDraft));
      setHasLocalDraft(true);
    } catch { /* Local storage can be unavailable in private browser contexts. */ }
  }, [draftReady, post]);

  useEffect(() => {
    if (!post) return;
    window.localStorage.removeItem(newPostDraftKey);
  }, [post]);

  useEffect(() => {
    if (post) return;
    const draft = readSavedPostDraft();
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (draft) {
        for (const [key, values] of Object.entries(draft.fields)) {
          const controls = formRef.current?.elements.namedItem(key);
          const elements = controls instanceof RadioNodeList ? Array.from(controls) : controls ? [controls] : [];
          elements.forEach((control) => {
            if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) return;
            if (control instanceof HTMLInputElement && (control.type === "checkbox" || control.type === "radio")) control.checked = values.includes(control.value);
            else control.value = values[0] ?? "";
            control.dispatchEvent(new Event("input", { bubbles: true }));
            control.dispatchEvent(new Event("change", { bubbles: true }));
          });
        }
        for (const [key, checked] of Object.entries(draft.checks)) {
          formRef.current?.querySelectorAll<HTMLInputElement>(`input[type="checkbox"][name="${CSS.escape(key)}"]`).forEach((input) => { input.checked = checked; input.dispatchEvent(new Event("change", { bubbles: true })); });
        }
        setValue("title", draft.fields.title?.[0] ?? "");
        setValue("slug", draft.fields.slug?.[0] ?? "");
        setValue("excerpt", draft.fields.excerpt?.[0] ?? "");
        setValue("seoTitle", draft.fields.seoTitle?.[0] ?? "");
        setValue("metaDescription", draft.fields.metaDescription?.[0] ?? "");
        setSlugTouched(Boolean(draft.fields.slug?.[0]));
        setSelectedAuthor(draft.fields.author?.[0] ?? selectedAuthor);
        setSelectedCategory(draft.fields.category?.[0] ?? selectedCategory);
        setContentHtml(draft.content);
        setHasLocalDraft(true);
      }
      setDraftReady(true);
    });
    return () => { cancelled = true; };
  // Draft recovery runs only once before the rich editor mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, setValue]);

  function discardDraft() {
    window.localStorage.removeItem(newPostDraftKey);
    window.location.reload();
  }

  return (
    <form ref={formRef} action={action} onInput={handleDraftInput} onChange={handleDraftInput} className="mt-8 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 rounded-lg border border-[var(--line)] bg-white p-5 [&_.grid]:min-w-0">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 rounded-lg border border-[var(--line)] bg-[#f7faf8] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">Content Basics</h2>
          <div className="flex flex-wrap gap-2 text-xs font-black uppercase text-[var(--accent)]">
            <span>{post?.wordCount ?? 0} words</span>
            <span>{post?.readingTime ?? 0} min read</span>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Title
            <input {...register("title")} name="title" required minLength={5} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
            <SeoHint label="Title length" value={watchedTitle} ideal="50-65 usually works well" limit={80} />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Slug
            <input
              {...slugField}
              name="slug"
              required
              minLength={3}
              title="Any slash in an article slug is converted to a hyphen automatically."
              onChange={(event) => {
                event.target.value = normalizePostSlug(event.target.value);
                slugField.onChange(event);
                setSlugTouched(true);
              }}
              className="rounded border border-[var(--line)] bg-white px-3 py-2"
            />
            {formState.errors.slug ? <span className="text-xs font-bold text-red-700">{formState.errors.slug.message}</span> : null}
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold">
          Excerpt
          <textarea {...register("excerpt")} name="excerpt" required minLength={20} className="min-h-24 rounded border border-[var(--line)] bg-white px-3 py-2" />
          <SeoHint label="Excerpt length" value={watchedExcerpt} ideal="Useful for cards and fallbacks" limit={500} />
        </label>
        <div className="grid min-w-0 gap-2 text-sm font-bold">
          Article Body
          {draftReady ? <RichEditor name="content" initialHtml={contentHtml} media={media} onHtmlChange={handleContentChange} /> : <div className="min-h-40 rounded-xl border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">Restoring your local draft…</div>}
          {!post && hasLocalDraft ? <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#c9dfd7] bg-[#eef5f1] px-3 py-2 text-xs font-bold text-[#315248]"><span>Draft saved on this device. It will restore after a refresh.</span><button type="button" onClick={discardDraft} className="text-xs font-black text-[var(--brand)] underline">Discard local draft</button></div> : null}
        </div>
        <div className="grid gap-3 rounded-lg border border-[var(--line)] bg-white p-4 text-sm">
          <h3 className="font-black">Live Content SEO</h3>
          <div className="grid gap-2 md:grid-cols-3">
            <p className={contentStats.words >= 600 ? "font-bold text-green-700" : "font-bold text-[#6d4b16]"}>{contentStats.words} words</p>
            <p className={contentStats.h2Count > 0 ? "font-bold text-green-700" : "font-bold text-[#6d4b16]"}>{contentStats.h2Count} H2 sections</p>
            <p className={contentStats.imagesMissingAlt === 0 ? "font-bold text-green-700" : "font-bold text-red-700"}>{contentStats.imagesMissingAlt} images missing alt</p>
            <p className="font-bold text-[#52635b]">{contentStats.bodyImages} body images</p>
            <p className="font-bold text-[#52635b]">{contentStats.internalLinks} internal links</p>
            <p className="font-bold text-[#52635b]">{contentStats.externalLinks} external links</p>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 rounded-lg border border-[var(--line)] bg-[#f7faf8] p-4">
        <h2 className="text-lg font-black">Publishing Workflow</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="grid gap-2 text-sm font-bold">
            <div className="flex items-center justify-between gap-2"><span>Author</span><button type="button" onClick={() => setCreatingEntity("author")} className="text-xs font-black text-[var(--brand)]">+ Create author</button></div>
            <select name="author" required value={selectedAuthor} onChange={(event) => setSelectedAuthor(event.target.value)} className="rounded border border-[var(--line)] bg-white px-3 py-2">
              {availableAuthors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
            </select>
            {creatingEntity === "author" ? <EntityCreator kind="author" onCancel={() => setCreatingEntity(null)} onCreated={(author) => { setAvailableAuthors((items) => items.some((item) => item.id === author.id) ? items : [...items, author]); setSelectedAuthor(author.id); }} /> : null}
          </div>
          <div className="grid gap-2 text-sm font-bold">
            <div className="flex items-center justify-between gap-2"><span>Category</span><button type="button" onClick={() => setCreatingEntity("category")} className="text-xs font-black text-[var(--brand)]">+ Create category</button></div>
            <select name="category" required value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="rounded border border-[var(--line)] bg-white px-3 py-2">
              {availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            {creatingEntity === "category" ? <EntityCreator kind="category" onCancel={() => setCreatingEntity(null)} onCreated={(category) => { setAvailableCategories((items) => items.some((item) => item.id === category.id) ? items : [...items, category]); setSelectedCategory(category.id); }} /> : null}
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold">
            Status
            <select name="status" defaultValue={post?.status ?? "draft"} className="rounded border border-[var(--line)] bg-white px-3 py-2">
              {["draft", "review", "scheduled", "published", "archived", "trash"].map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Published At
            <input name="publishedAt" type="datetime-local" defaultValue={dateTimeValue(post?.publishedAt)} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Scheduled At
            <input name="scheduledAt" type="datetime-local" defaultValue={dateTimeValue(post?.scheduledAt)} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
        </div>
        <div className="flex flex-wrap gap-6 text-sm font-bold">
          <label><input type="checkbox" name="featured" defaultChecked={post?.featured ?? false} /> Featured</label>
          <label><input type="checkbox" name="editorPick" defaultChecked={post?.editorPick ?? false} /> Editor pick</label>
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 rounded-lg border border-[var(--line)] bg-[#f7faf8] p-4">
        <h2 className="text-lg font-black">Trust, Review And Schema</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold">
            Reviewer
            <select name="reviewer" defaultValue={post?.reviewer?.id ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2">
              <option value="">None</option>
              {availableAuthors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Fact Checked By
            <select name="factCheckedBy" defaultValue={post?.factCheckedBy?.id ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2">
              <option value="">None</option>
              {availableAuthors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Last Reviewed At
            <input name="lastReviewedAt" type="datetime-local" defaultValue={dateTimeValue(post?.lastReviewedAt)} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Reviewed By Text
            <input name="reviewedBy" defaultValue={post?.reviewedBy ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Schema Type
            <select name="schemaType" defaultValue={post?.schemaType ?? "BlogPosting"} className="rounded border border-[var(--line)] bg-white px-3 py-2">
              {["Article", "BlogPosting", "NewsArticle"].map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
        </div>
      </section>

      <FeaturedImageFields currentImage={post?.featuredImage} media={media} />

      <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 rounded-lg border border-[var(--line)] bg-[#f7faf8] p-4">
        <h2 className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Tags</h2>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-3 text-sm font-bold">
            {tags.map((tag) => (
              <label key={tag.id} className="rounded border border-[var(--line)] bg-white px-3 py-2">
                <input className="mr-2" type="checkbox" name="tags" value={tag.id} defaultChecked={post?.tags.some((item) => item.id === tag.id) ?? false} />
                {tag.name}
              </label>
            ))}
          </div>
        ) : <p className="text-sm text-[var(--muted)]">No tags yet.</p>}
        <label className="grid gap-2 text-sm font-bold">
          Add New Tags
          <input name="newTags" placeholder="SEO, Blogging, Content Strategy" className="rounded border border-[var(--line)] bg-white px-3 py-2" />
        </label>
      </section>

      <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 rounded-lg border border-[var(--line)] bg-[#f7faf8] p-4">
        <h2 className="text-lg font-black">Search SEO</h2>
        <div className="rounded-lg border border-[var(--line)] bg-white p-4">
          <p className="line-clamp-1 text-lg font-bold text-[#1a0dab]">{previewTitle}</p>
          <p className="mt-1 text-xs text-[#006621]">https://example.com/{selectedCategorySlug}/{watchedSlug || "post-slug"}</p>
          <p className="mt-2 text-sm leading-6 text-[#4d5156]">{previewDescription}</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            SEO Title
            <input {...register("seoTitle")} name="seoTitle" className="rounded border border-[var(--line)] bg-white px-3 py-2" />
            <SeoHint label="SEO title" value={watchedSeoTitle} ideal="Keep near 50-65 chars" limit={65} />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Canonical URL
            <input name="canonicalUrl" defaultValue={post?.canonicalUrl ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold">
          Meta Description
          <textarea {...register("metaDescription")} name="metaDescription" className="min-h-28 rounded border border-[var(--line)] bg-white px-3 py-2" />
          <SeoHint label="Meta description" value={watchedMeta} ideal="Keep near 140-160 chars" limit={170} />
        </label>
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Focus Keyword
            <input name="focusKeyword" defaultValue={post?.focusKeyword ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Secondary Keywords
            <input name="secondaryKeywords" defaultValue={post?.secondaryKeywords.join(", ") ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
        </div>
        <div className="flex flex-wrap gap-6 text-sm font-bold">
          <label><input type="checkbox" {...register("robotsIndex")} name="robotsIndex" defaultChecked={post?.robotsIndex ?? true} /> Index</label>
          <label><input type="checkbox" {...register("robotsFollow")} name="robotsFollow" defaultChecked={post?.robotsFollow ?? true} /> Follow</label>
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 rounded-lg border border-[var(--line)] bg-[#f7faf8] p-4">
        <h2 className="text-lg font-black">Social Preview</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Open Graph Title
            <input name="ogTitle" defaultValue={post?.ogTitle ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Open Graph Description
            <input name="ogDescription" defaultValue={post?.ogDescription ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Open Graph Image URL
            <input name="ogImageUrl" defaultValue={post?.ogImage?.url ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Open Graph Image Alt
            <input name="ogImageAlt" defaultValue={post?.ogImage?.alt ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Twitter Title
            <input name="twitterTitle" defaultValue={post?.twitterTitle ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Twitter Description
            <input name="twitterDescription" defaultValue={post?.twitterDescription ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Twitter Image URL
            <input name="twitterImageUrl" defaultValue={post?.twitterImage?.url ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Twitter Image Alt
            <input name="twitterImageAlt" defaultValue={post?.twitterImage?.alt ?? ""} className="rounded border border-[var(--line)] bg-white px-3 py-2" />
          </label>
        </div>
      </section>

      <StructuredSeoFields sources={post?.sources} references={post?.references} faqs={post?.faqs} />

      {formState.errors.title ? <p className="text-sm text-red-700">Title must be at least five characters.</p> : null}
      {state.message ? <p className={state.ok ? "text-sm text-green-700" : "text-sm text-red-700"}>{state.message}</p> : null}
      <button disabled={pending} className="w-fit rounded-md bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Saving..." : post ? "Update Post" : "Save Post"}
      </button>
    </form>
  );
}
