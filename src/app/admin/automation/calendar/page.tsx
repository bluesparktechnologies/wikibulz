import { requireRole } from "@/lib/auth/guards";
import { getAutomationCalendar } from "@/modules/autoblog/repositories/automation.repository";

export default async function AutomationCalendarPage() {
  await requireRole("seo");
  const calendar = await getAutomationCalendar();
  const queue = calendar.queue as Array<{ _id: string; status: string; scheduledFor?: string; timezone: string; qualityScore?: number; postId?: { title?: string } }>;
  const refreshes = calendar.refreshes as Array<{ _id: string; reason: string; severity: string; status: string; postId?: { title?: string } }>;
  return (
    <>
      <h1 className="text-4xl font-black">Editorial Calendar</h1>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Publishing Queue</h2>
        <div className="mt-4 grid gap-3">
          {queue.length ? queue.map((item) => (
            <div key={item._id} className="rounded border border-[var(--line)] p-3 text-sm">
              <p className="font-bold">{item.postId?.title ?? "Untitled queued post"}</p>
              <p className="text-[var(--muted)]">{item.status} - {item.scheduledFor ?? "not scheduled"} - {item.timezone} - quality {item.qualityScore ?? "pending"}</p>
            </div>
          )) : <p className="text-sm text-[var(--muted)]">No queued articles yet.</p>}
        </div>
      </section>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Refresh Work</h2>
        <div className="mt-4 grid gap-3">
          {refreshes.length ? refreshes.map((item) => (
            <div key={item._id} className="rounded border border-[var(--line)] p-3 text-sm">
              <p className="font-bold">{item.postId?.title ?? "Refresh candidate"}</p>
              <p className="text-[var(--muted)]">{item.severity} - {item.status} - {item.reason}</p>
            </div>
          )) : <p className="text-sm text-[var(--muted)]">No refresh candidates yet.</p>}
        </div>
      </section>
    </>
  );
}
