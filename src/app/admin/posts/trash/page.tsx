import Link from "next/link";
import { ArchiveRestore, ArrowLeft, Trash2 } from "lucide-react";
import { permanentlyDeletePostAction, restorePostFromTrashAction } from "@/app/admin/posts/actions";
import { requireUser } from "@/lib/auth/guards";
import { getTrashedPostsForAdmin } from "@/repositories/content.repository";

type Props = { searchParams: Promise<{ message?: string }> };

export default async function AdminPostTrashPage({ searchParams }: Props) {
  await requireUser();
  const [posts, query] = await Promise.all([getTrashedPostsForAdmin(100), searchParams]);
  return <>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Posts</p>
        <h1 className="mt-2 text-4xl font-black">Trash</h1>
        <p className="mt-2 text-[var(--muted)]">Trashed posts are hidden from the public site. Restoring returns a post as a noindex draft.</p>
      </div>
      <Link href="/admin/posts" className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-4 py-2 text-sm font-bold hover:bg-[#f5faf7]"><ArrowLeft size={16} />All posts</Link>
    </div>
    {query.message ? <p className="mt-5 text-sm font-semibold text-green-700">{query.message}</p> : null}
    {posts.length ? <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--line)] bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f5faf7]"><tr><th className="p-4">Title</th><th>Category</th><th>Trashed</th><th className="p-4">Actions</th></tr></thead><tbody>{posts.map((post) => <tr key={post.id} className="border-t border-[var(--line)]"><td className="p-4"><p className="font-bold">{post.title}</p><p className="mt-1 text-xs text-[var(--muted)]">{post.slug}</p></td><td>{post.category.name}</td><td>{new Date(post.updatedAt).toLocaleDateString()}</td><td className="p-4"><div className="flex flex-wrap gap-2"><form action={restorePostFromTrashAction}><input type="hidden" name="id" value={post.id} /><button className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] px-3 py-1.5 text-xs font-bold hover:bg-[#f5faf7]"><ArchiveRestore size={14} />Restore as draft</button></form><details className="relative"><summary className="cursor-pointer list-none rounded-md border border-red-300 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50">Delete permanently</summary><form action={permanentlyDeletePostAction} className="absolute right-0 z-10 mt-2 w-64 rounded-md border border-red-200 bg-white p-3 shadow-lg"><input type="hidden" name="id" value={post.id} /><p className="text-xs leading-5 text-[var(--muted)]">This removes the post from MongoDB and cannot be undone.</p><button className="mt-3 w-full rounded-md bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800">Confirm permanent deletion</button></form></details></div></td></tr>)}</tbody></table></div> : <section className="mt-8 rounded-lg border border-dashed border-[var(--line)] bg-white px-6 py-12 text-center"><Trash2 className="mx-auto text-[var(--muted)]" size={28} /><h2 className="mt-4 text-xl font-black">Trash is empty</h2><p className="mt-2 text-sm text-[var(--muted)]">Posts you delete will appear here before they are permanently removed.</p></section>}
  </>;
}
