import Image from "next/image";
import Link from "next/link";
import { AuthorDeleteForm, AuthorForm } from "@/components/admin/entity-forms";
import { requireRole } from "@/lib/auth/guards";
import { getAdminAuthors } from "@/repositories/admin.repository";
import type { Author } from "@/types/content";

function authorCompleteness(author: Author) {
  const checks = [
    Boolean(author.avatar?.url),
    author.bio.length >= 80,
    Boolean(author.jobTitle),
    author.expertise.length > 0,
    author.credentials.length > 0 || Boolean(author.education?.length),
    Boolean(author.website) || author.socialLinks.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function missingAuthorFields(author: Author) {
  const missing = [
    author.avatar?.url ? "" : "photo",
    author.bio.length >= 80 ? "" : "bio",
    author.jobTitle ? "" : "title",
    author.expertise.length ? "" : "expertise",
    author.credentials.length || author.education?.length ? "" : "proof",
    author.website || author.socialLinks.length ? "" : "links",
  ].filter(Boolean);
  return missing.length ? missing.join(", ") : "complete";
}

export default async function AuthorsAdminPage({ searchParams }: { searchParams?: Promise<{ edit?: string; error?: string; message?: string }> }) {
  await requireRole("editor");
  const rows = await getAdminAuthors();
  const query = await searchParams;
  const editing = rows.find((row) => row.id === query?.edit);

  return <>
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-4xl font-black">Authors</h1>
        <p className="mt-2 max-w-3xl text-[var(--muted)]">Create complete public author profiles with real identity, proof, expertise, and profile images.</p>
      </div>
      <div className="rounded-lg border border-[#cfe0d8] bg-white px-4 py-3 text-sm">
        <p className="font-black">{rows.length} authors</p>
        <p className="text-[var(--muted)]">Inactive authors stay out of new publishing flows.</p>
      </div>
    </div>

    {query?.error ? <p className="mt-4 text-sm text-red-700">{query.error}</p> : null}
    {query?.message ? <p className="mt-4 text-sm text-green-700">{query.message}</p> : null}

    <div className="mt-8">
      {editing ? <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black">Edit Author</h2>
          <Link href="/admin/authors" className="text-sm font-bold text-[var(--brand)]">Cancel</Link>
        </div>
        <AuthorForm author={editing}/>
      </div> : <AuthorForm />}
    </div>

    <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
      <table className="w-full min-w-[940px] text-left text-sm">
        <thead className="bg-[#f7fbf8]">
          <tr>
            <th className="p-4">Profile</th>
            <th>Role</th>
            <th>Expertise</th>
            <th>Proof</th>
            <th>Completeness</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[var(--line)] align-top">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {row.avatar?.url ? <Image src={row.avatar.url} alt={row.avatar.alt} width={48} height={48} unoptimized className="size-12 rounded-lg object-cover"/> : <div className="grid size-12 place-items-center rounded-lg bg-[#e7f1ec] text-lg font-black text-[var(--brand)]">{row.name.slice(0, 1)}</div>}
                  <div>
                    <p className="font-black">{row.name}</p>
                    <p className="text-xs text-[var(--muted)]">{row.email}</p>
                    <Link href={`/author/${row.slug}`} className="text-xs font-bold text-[var(--brand)]">View profile</Link>
                  </div>
                </div>
              </td>
              <td className="max-w-48 py-4">
                <p className="font-semibold">{row.jobTitle || "No title"}</p>
                <p className="text-xs text-[var(--muted)]">{row.organization || row.location || "No organization/location"}</p>
              </td>
              <td className="max-w-64 py-4">{row.expertise.length ? row.expertise.join(", ") : <span className="text-[var(--muted)]">Missing</span>}</td>
              <td className="max-w-64 py-4">
                <p>{row.credentials.length ? row.credentials.join(", ") : row.education?.length ? row.education.join(", ") : <span className="text-[var(--muted)]">Missing</span>}</p>
                {row.socialLinks.length || row.website ? <p className="mt-1 text-xs text-[var(--muted)]">Links added</p> : null}
              </td>
              <td className="py-4">
                <p className="font-black">{authorCompleteness(row)}%</p>
                <p className="max-w-40 text-xs text-[var(--muted)]">{missingAuthorFields(row)}</p>
              </td>
              <td className="py-4">{row.status}</td>
              <td className="py-4">
                <div className="flex gap-2">
                  <Link href={`/admin/authors?edit=${row.id}`} className="rounded border border-[var(--line)] px-3 py-1 text-xs font-bold">Edit</Link>
                  <AuthorDeleteForm authorId={row.id} name={row.name}/>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>;
}
