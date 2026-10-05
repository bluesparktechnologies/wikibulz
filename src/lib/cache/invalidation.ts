import { revalidatePath, revalidateTag } from "next/cache";
import { deleteCacheKeys } from "@/lib/cache/cache";
import { buildPostUrl } from "@/lib/seo/url";
import type { Post } from "@/types/content";

function safeRevalidate(action: () => void) {
  try {
    action();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("static generation store missing")) throw error;
  }
}

export async function invalidatePost(post: Post) {
  await deleteCacheKeys([
    "post:" + post.slug,
    "posts:published:20:1",
    "posts:published:50:1",
    "posts:published:100:1",
    "posts:published:200:1",
    "posts:published:500:1",
    "posts:published:50000:1",
    "category:" + post.category.slug,
    "related:" + post.id,
    "homepage",
    "popular:daily",
    "sitemap:posts",
  ]);
  safeRevalidate(() => revalidatePath(buildPostUrl(post), "page"));
  safeRevalidate(() => revalidatePath("/category/" + post.category.slug, "page"));
  safeRevalidate(() => revalidatePath("/", "page"));
  safeRevalidate(() => revalidateTag("sitemap", "max"));
}
