import Image from "next/image";
import Link from "next/link";
import { buildPostUrl } from "@/lib/seo/url";
import type { Post } from "@/types/content";

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <article className="group grid gap-4 border-b border-[var(--line)] pb-6">
      <Link href={buildPostUrl(post)} className="block overflow-hidden rounded-md bg-[#eaf0ec]">
        <Image
          src={post.featuredImage.url}
          alt={post.featuredImage.alt}
          width={post.featuredImage.width}
          height={post.featuredImage.height}
          priority={priority}
          unoptimized={post.featuredImage.url.startsWith("http")}
          className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </Link>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--accent)]">{post.category.name}</p>
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
