import { notFound } from "next/navigation";
import Link from "next/link";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { generateCategoryMetadata, generateListingMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";
import { buildCategoryUrl, buildPostUrl, resolveCategoryCanonical } from "@/lib/seo/url";
import { parsePageParam } from "@/lib/seo/pagination";
import { getCategories, getCategoryBySlug, getChildCategories, getPostsByCategory } from "@/repositories/content.repository";
import type { Category } from "@/types/content";

export const revalidate = 300;
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string[] }>; searchParams?: Promise<{ page?: string | string[] }> };

function categoryAncestors(categories: Category[], category: Category) {
  const byId = new Map(categories.map((item) => [item.id, item]));
  const ancestors: Category[] = [];
  let current = category.parentCategory ? byId.get(category.parentCategory) : undefined;
  const seen = new Set<string>([category.id]);
  while (current && !seen.has(current.id)) {
    ancestors.unshift(current);
    seen.add(current.id);
    current = current.parentCategory ? byId.get(current.parentCategory) : undefined;
  }
  return ancestors;
}

export async function generateMetadata({ params, searchParams }: Props) {
  const categorySlug = (await params).slug.join("/");
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};
  const page = parsePageParam((await searchParams)?.page);
  if (!page) return { title: "Not Found", robots: { index: false, follow: false } };
  const posts = await getPostsByCategory(categorySlug, page);
  const base = generateCategoryMetadata(category);
  const canonical = resolveCategoryCanonical(category, page);
  const title = page > 1 ? `${category.name} - Page ${page}` : String(base.title ?? category.name);
  return generateListingMetadata({ title, description: String(base.description ?? category.description), canonical, index: category.indexStatus === "index" && posts.length > 0 });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const categorySlug = (await params).slug.join("/");
  const page = parsePageParam((await searchParams)?.page);
  if (!page) notFound();
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();
  const currentPage = page;
  const [posts, nextPosts, childCategories, categories] = await Promise.all([getPostsByCategory(categorySlug, currentPage), getPostsByCategory(categorySlug, currentPage + 1), getChildCategories(category.id), getCategories()]);
  if (!posts.length && currentPage > 1) notFound();
  const ancestors = categoryAncestors(categories, category);
  const breadcrumbItems = [{ name: "Home", url: "/" }, ...ancestors.map((item) => ({ name: item.name, url: buildCategoryUrl(item) })), { name: category.name, url: buildCategoryUrl(category) }];
  const listItems = posts.length ? posts.map((post) => ({ name: post.title, url: buildPostUrl(post) })) : childCategories.map((child) => ({ name: child.name, url: buildCategoryUrl(child) }));

  return (
    <>
      <SiteHeader />
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
      {listItems.length ? <JsonLd data={itemListSchema(listItems, `${category.name} guides`)} /> : null}
      <main className="mx-auto max-w-7xl px-5 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Category</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">{category.name}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">{category.description}</p>
        {childCategories.length ? (
          <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
            <h2 className="text-xl font-black">Explore related topics</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {childCategories.map((child) => <Link key={child.id} href={buildCategoryUrl(child)} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--brand-strong)] transition hover:border-[var(--brand)] hover:bg-[#edf5f1]">{child.name}</Link>)}
            </div>
          </section>
        ) : null}
        {posts.length ? (
          <>
            <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
            <nav className="mt-10 flex gap-3 text-sm font-bold">
              {currentPage > 1 ? <Link href={currentPage === 2 ? buildCategoryUrl(category) : `${buildCategoryUrl(category)}?page=${currentPage - 1}`} className="rounded border border-[var(--line)] px-4 py-2">Previous</Link> : null}
              {nextPosts.length ? <Link href={`${buildCategoryUrl(category)}?page=${currentPage + 1}`} className="rounded border border-[var(--line)] px-4 py-2">Next</Link> : null}
            </nav>
          </>
        ) : (
          <p className="mt-8 rounded-lg border border-dashed border-[var(--line)] bg-white p-6 text-[var(--muted)]">Articles in this topic will appear after publication.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
