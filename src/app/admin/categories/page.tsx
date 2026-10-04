import Link from "next/link";
import { CategoryDeleteForm, CategoryForm } from "@/components/admin/entity-forms";
import { requireRole } from "@/lib/auth/guards";
import { getAdminCategories } from "@/repositories/admin.repository";

export default async function CategoriesAdminPage({ searchParams }: { searchParams?: Promise<{ edit?: string; error?: string; message?: string }> }) {
  await requireRole("editor");
  const rows = await getAdminCategories();
  const query = await searchParams;
  const editing = rows.find((row) => row.id === query?.edit);

  return <>
    <h1 className="text-4xl font-black">Categories</h1>
    <p className="mt-2 text-[var(--muted)]">Manage nested archive SEO, descriptions, canonicals, and index controls.</p>
    <section className="mt-5 rounded-lg border border-[#c9dfd7] bg-[#eef7f3] p-4 text-sm leading-6 text-[#315248]">
      <p className="font-black">How to create category and subcategory</p>
      <p className="mt-1">Main category ke liye <strong>Parent category</strong> ko <strong>Top-level category</strong> par rehne do. Subcategory ke liye pehle main category save karo, phir nayi category banate waqt us main category ko parent select karo.</p>
      <p className="mt-1">Example: pehle <strong>Healthcare</strong> save karo. Phir <strong>Dentists</strong> create karte waqt parent <strong>Healthcare</strong> select karo.</p>
    </section>
    {query?.error ? <p className="mt-4 text-sm text-red-700">{query.error}</p> : null}
    {query?.message ? <p className="mt-4 text-sm text-green-700">{query.message}</p> : null}
    <div className="mt-8">
      {editing ? <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black">Edit Category</h2>
          <Link href="/admin/categories" className="text-sm font-bold text-[var(--brand)]">Cancel</Link>
        </div>
        <CategoryForm category={editing} categoryId={editing.id} categories={rows} />
      </div> : <CategoryForm categories={rows} />}
    </div>
    <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr><th className="p-4">Name</th><th>Slug</th><th>Parent</th><th>Index</th><th>Description</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => <tr key={row.id} className="border-t border-[var(--line)]">
            <td className="p-4 font-bold">{row.name}</td>
            <td>{row.slug}</td>
            <td>{rows.find((parent) => parent.id === row.parentCategory)?.name ?? "-"}</td>
            <td>{row.indexStatus}</td>
            <td className="max-w-lg truncate">{row.description}</td>
            <td><div className="flex gap-2"><Link href={`/admin/categories?edit=${row.id}`} className="rounded border border-[var(--line)] px-3 py-1 text-xs font-bold">Edit</Link><CategoryDeleteForm categoryId={row.id} name={row.name} /></div></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </>;
}