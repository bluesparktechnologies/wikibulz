import { notFound } from "next/navigation";
import { ArticleView } from "@/components/blog/article";
import { LocationPageView } from "@/components/blog/location-page";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { generateLocationMetadata, generatePageMetadata, generatePostMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema, faqSchema, itemListSchema } from "@/lib/seo/schema";
import { sanitizeArticleHtml } from "@/lib/seo/analysis";
import { buildCategoryUrl, buildLocationUrl, normalizePath, resolvePostCanonical } from "@/lib/seo/url";
import { getCategoriesByLocation, getLocationBySlug, getPostBySlug, getRedirects, getRelatedPosts, getStaticPage, getPostsByLocation } from "@/repositories/content.repository";
import { trackNotFound } from "@/services/not-found";
import { followRedirect } from "@/services/redirects";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = await getStaticPage(slug);
  if (page) return generatePageMetadata(page);
  const location = await getLocationBySlug(slug);
  if (location) {
    const posts = await getPostsByLocation(location.location, location.type);
    return generateLocationMetadata(location.location, posts.length > 0);
  }
  const post = await getPostBySlug(slug);
  return post ? generatePostMetadata(post) : {};
}
export default async function RootSlugPage({ params }: Props) {
  const { slug } = await params;
  const requestedPath = "/" + slug;
  const historical = (await getRedirects()).find((item) => item.active && normalizePath(item.sourcePath) === normalizePath(requestedPath));
  if (historical) followRedirect(historical);

  const page = await getStaticPage(slug);
  if (page) {
    return <><SiteHeader /><main className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-5xl font-black">{page.title}</h1><p className="mt-4 text-lg text-[var(--muted)]">{page.excerpt}</p><div className="prose-content mt-8" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(page.content) }} /></main><Footer /></>;
  }

  const location = await getLocationBySlug(slug);
  if (location) {
    const [posts, categories] = await Promise.all([getPostsByLocation(location.location, location.type), getCategoriesByLocation(location.location, location.type)]);
    const parents = location.type === "country" ? [] : location.type === "state" ? [{ name: location.location.country.name, url: buildLocationUrl(location.location.country) }] : [{ name: location.location.country.name, url: buildLocationUrl(location.location.country) }, { name: location.location.state.name, url: buildLocationUrl(location.location.state) }];
    const listItems = posts.length ? posts.slice(0, 12).map((post) => ({ name: post.title, url: resolvePostCanonical(post) })) : categories.map((category) => ({ name: category.name, url: buildCategoryUrl(category) }));
    return <><SiteHeader /><JsonLd data={breadcrumbSchema([{ name: "Home", url: "/" }, ...parents, { name: location.location.name, url: buildLocationUrl(location.location) }])} />{listItems.length ? <JsonLd data={itemListSchema(listItems, `${location.location.name} local guides`)} /> : null}<LocationPageView type={location.type} location={location.location} categories={categories} posts={posts} /><Footer /></>;
  }

  const post = await getPostBySlug(slug);
  if (post) {
    const related = await getRelatedPosts(post);
    const faq = faqSchema(post);
    const breadcrumbs = [
      { name: "Home", url: "/" },
      post.country ? { name: post.country.name, url: buildLocationUrl(post.country) } : null,
      post.state ? { name: post.state.name, url: buildLocationUrl(post.state) } : null,
      post.city ? { name: post.city.name, url: buildLocationUrl(post.city) } : null,
      { name: post.category.name, url: buildCategoryUrl(post.category) },
      { name: post.title, url: resolvePostCanonical(post) },
    ].filter((item): item is { name: string; url: string } => Boolean(item));
    return <><SiteHeader /><JsonLd data={articleSchema(post)} /><JsonLd data={breadcrumbSchema(breadcrumbs)} />{faq ? <JsonLd data={faq} /> : null}<ArticleView post={post} related={related} /><Footer /></>;
  }

  await trackNotFound(requestedPath);
  notFound();
}
