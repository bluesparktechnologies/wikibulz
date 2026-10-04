import Image from "next/image";
import Link from "next/link";
import { buildPostUrl } from "@/lib/seo/url";
import type { Post } from "@/types/content";

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <article className="group grid gap-4 rounded-lg border border-[var(--line)] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={buildPostUrl(post)} className="block overflow-hidden rounded-md bg-[#eaf0ec]">
        <Image
          src={post.featuredImage.url}
          alt={post.featuredImage.alt}
          width={post.featuredImage.width}
          height={post.featuredImage.height}
          preload={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="px-1 pb-2">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--accent)]">{post.city ? post.city.name + " / " : ""}{post.category.name}</p>
        <h2 className="mt-2 text-xl font-black leading-snug text-[var(--foreground)] md:text-2xl">
          <Link href={buildPostUrl(post)} className="hover:text-[var(--brand)]">{post.title}</Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{post.excerpt}</p>
        <p className="mt-3 text-xs font-semibold text-[#65766e]">
          {post.readingTime || 3} min read / Updated {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(post.updatedAt))}
        </p>
      </div>
    </article>
  );
}
