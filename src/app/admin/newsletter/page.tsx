import { requireRole } from "@/lib/auth/guards";
import { getNewsletterSubscribers } from "@/repositories/newsletter.repository";

export const dynamic = "force-dynamic";

export default async function NewsletterAdminPage() {
  await requireRole("admin");
  const result = await getNewsletterSubscribers();
  const activeCount = result.subscribers.filter((subscriber) => subscriber.status === "active").length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Audience</p>
          <h1 className="mt-2 text-4xl font-black">Newsletter Subscribers</h1>
          <p className="mt-2 text-[var(--muted)]">View newsletter email addresses collected from the public signup forms.</p>
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-white px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Active subscribers</p>
          <p className="mt-1 text-3xl font-black">{activeCount}</p>
        </div>
      </div>

      {!result.available ? (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900">
          MongoDB is not connected. Subscriber data cannot be displayed or persisted until the database is available.
        </div>
      ) : null}

      <section className="mt-8 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#f5faf7]">
              <tr>
                <th className="p-4">Email</th>
                <th>Source</th>
                <th>Status</th>
                <th>Subscribed</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {result.subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-t border-[var(--line)]">
                  <td className="p-4 font-bold">{subscriber.email}</td>
                  <td>{subscriber.source}</td>
                  <td>{subscriber.status}</td>
                  <td>{subscriber.createdAt ? new Date(subscriber.createdAt).toLocaleString() : "—"}</td>
                  <td>{subscriber.updatedAt ? new Date(subscriber.updatedAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
              {!result.subscribers.length ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--muted)]">No newsletter subscribers yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
