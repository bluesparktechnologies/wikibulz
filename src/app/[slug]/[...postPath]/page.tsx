import { notFound, permanentRedirect } from "next/navigation";
import { ArticleView } from "@/components/blog/article";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { JsonLd } from "@/components/seo/json-ld";
import LoginPage from "@/app/admin/login/page";
import { buildCategoryUrl, buildLocationUrl, buildPostUrl, normalizePath, resolvePostCanonical } from "@/lib/seo/url";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import { generatePostMetadata } from "@/lib/seo/metadata";
import { getPostByCategoryPath, getPostBySlugs, getRedirects, getRelatedPosts } from "@/repositories/content.repository";
import { trackNotFound } from "@/services/not-found";
import { followRedirect } from "@/services/redirects";

export const revalidate = 300;
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string; postPath: string[] }> };

async function resolvePost(slug: string, postPath: string[]) {
  if (postPath.length === 1) return getPostBySlugs(slug, postPath[0]);
  const categoryPath = [slug, ...postPath.slice(0, -1)];
  return getPostByCategoryPath(categoryPath, postPath[postPath.length - 1]);
}

export async function generateMetadata({ params }: Props) {
  const { slug, postPath } = await params;
  const post = await resolvePost(slug, postPath);
  return post ? generatePostMetadata(post) : {};
}

export default async function PostPage({ params }: Props) {
  const { slug, postPath } = await params;
  if (slug === "admin" && postPath.length === 1 && postPath[0] === "login") return <LoginPage />;

  const requestedPath = "/" + [slug, ...postPath].join("/");
  const post = await resolvePost(slug, postPath);
  if (!post) {
    const historical = (await getRedirects()).find((item) => item.active && normalizePath(item.sourcePath) === normalizePath(requestedPath));
    if (historical) followRedirect(historical);
    await trackNotFound(requestedPath);
    notFound();
  }

  const officialUrl = buildPostUrl(post);
  if (officialUrl !== requestedPath) permanentRedirect(officialUrl);
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
