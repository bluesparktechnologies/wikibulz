import { PostEditor } from "@/components/admin/post-editor";
import { requireUser } from "@/lib/auth/guards";
import { getAdminMedia, getAdminTags } from "@/repositories/admin.repository";
import { getAuthors, getCategories, getCities, getCountries, getStates } from "@/repositories/content.repository";

export default async function NewPostPage() {
  await requireUser();
  const [authors, categories, countries, states, cities, tags, media] = await Promise.all([getAuthors(), getCategories(), getCountries(), getStates(), getCities(), getAdminTags(), getAdminMedia()]);
  return <><h1 className="text-4xl font-black">New Post</h1><p className="mt-2 text-[var(--muted)]">The editor stores SEO fields, sanitizes HTML, calculates TOC/reading time, and preserves old URLs with redirects when published URLs change.</p><PostEditor authors={authors} categories={categories} countries={countries} states={states} cities={cities} tags={tags} media={media} /></>;
}
