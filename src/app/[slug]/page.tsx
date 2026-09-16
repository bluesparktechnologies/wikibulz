import { notFound } from "next/navigation";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { sanitizeArticleHtml } from "@/lib/seo/analysis";
import { normalizePath } from "@/lib/seo/url";
import { getRedirects, getStaticPage } from "@/repositories/content.repository";
import { trackNotFound } from "@/services/not-found";
import { followRedirect } from "@/services/redirects";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props) { const page = await getStaticPage((await params).slug); return page ? generatePageMetadata(page) : {}; }
export default async function StaticPage({ params }: Props) { const { slug } = await params; const requestedPath = "/" + slug; const historical = (await getRedirects()).find((item) => item.active && normalizePath(item.sourcePath) === normalizePath(requestedPath)); if (historical) followRedirect(historical); const page = await getStaticPage(slug); if (!page) { await trackNotFound(requestedPath); notFound(); } return <><SiteHeader /><main className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-5xl font-black">{page.title}</h1><p className="mt-4 text-lg text-[var(--muted)]">{page.excerpt}</p><div className="prose-content mt-8" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(page.content) }} /></main><Footer /></>; }