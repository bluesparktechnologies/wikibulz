import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { generateAuthorMetadata } from "@/lib/seo/metadata";
import { personSchema } from "@/lib/seo/schema";
import { getAuthorBySlug, getPostsByAuthor } from "@/repositories/content.repository";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> { const author = await getAuthorBySlug((await params).slug); if (!author) return {}; const posts = await getPostsByAuthor(author.slug); return { ...generateAuthorMetadata(author), robots: { index: author.status === "active" && posts.length > 0, follow: true } }; }
export default async function AuthorPage({ params }: Props) { const author = await getAuthorBySlug((await params).slug); if (!author) notFound(); const posts = await getPostsByAuthor(author.slug); return <><SiteHeader /><JsonLd data={personSchema(author)} /><main className="mx-auto max-w-7xl px-5 py-10"><section className="grid gap-8 rounded-lg border border-[var(--line)] bg-white p-6 md:grid-cols-[160px_1fr]">{author.avatar ? <Image src={author.avatar.url} alt={author.avatar.alt} width={160} height={160} className="size-40 rounded-lg object-cover"/> : null}<div><h1 className="text-5xl font-black">{author.name}</h1><p className="mt-2 text-lg font-semibold text-[var(--accent)]">{author.jobTitle}</p><p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">{author.bio}</p><p className="mt-4 text-sm font-semibold">Expertise: {author.expertise.join(", ")}</p><p className="mt-2 text-sm text-[var(--muted)]">Credentials are shown only when entered by admins: {author.credentials.join(", ") || "none listed"}</p></div></section><h2 className="mt-10 text-3xl font-black">Articles by {author.name}</h2><div className="mt-6 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCard key={post.id} post={post}/>)}</div></main><Footer /></>; }
