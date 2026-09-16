import Link from "next/link";
import { approveQueueItemAction, cancelQueueItemAction, publishQueueItemNowAction, scheduleQueueItemAction } from "@/app/admin/automation/actions";
import { requireRole } from "@/lib/auth/guards";
import { getAutomationDashboard } from "@/modules/autoblog/repositories/automation.repository";

export default async function AutomationQueuePage() {
  await requireRole("admin");
  const dashboard = await getAutomationDashboard();
  const queue = dashboard.queue as Array<{ _id: string; status: string; scheduledFor?: string; timezone: string; qualityScore?: number; plagiarismScore?: number; factCheckPassed: boolean; seoPassed: boolean; imagesReady: boolean; lastError?: string; postId?: string | { _id: string; title?: string; status?: string; robotsIndex?: boolean }; automationRunId?: string }>;
  const actionableStatuses = new Set(["PREPARING", "READY", "SCHEDULED", "PUBLISHING"]);
  const activeQueue = queue.filter((item) => actionableStatuses.has(item.status));
  const history = queue.filter((item) => !actionableStatuses.has(item.status));
  const renderQueueItem = (item: typeof queue[number]) => {
    const post = typeof item.postId === "object" ? item.postId : null;
    const postId = post ? post._id : item.postId;
    const postPublishable = Boolean(postId) && (!post || (post.status !== "trash" && post.status !== "archived" && post.robotsIndex !== false));
    const terminal = ["PUBLISHED", "FAILED", "CANCELLED", "PUBLISHING"].includes(item.status);
    return <div key={item._id} className="rounded border border-[var(--line)] p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold">{item.status} - {item.scheduledFor ? new Date(item.scheduledFor).toLocaleString() : "not scheduled"}</p>
          {post?.title ? <p className="mt-1 text-[var(--muted)]">{post.title} - post {post.status ?? "unknown"}</p> : null}
          {postId ? <Link href={`/admin/posts/${postId}`} className="mt-1 inline-block font-bold text-[var(--brand)]">Open post</Link> : null}
          {item.automationRunId ? <Link href={`/admin/automation/runs/${item.automationRunId}`} className="ml-3 inline-block font-bold text-[var(--brand)]">Open run</Link> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={approveQueueItemAction}>
            <input type="hidden" name="queueItemId" value={item._id} />
            <button disabled={!postPublishable || terminal} className="rounded-md border border-[var(--line)] px-3 py-2 text-xs font-bold disabled:opacity-50">Approve</button>
          </form>
          <form action={publishQueueItemNowAction}>
            <input type="hidden" name="queueItemId" value={item._id} />
            <button disabled={!postPublishable || terminal} className="rounded-md bg-[var(--brand)] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Publish Now</button>
          </form>
          <form action={cancelQueueItemAction}>
            <input type="hidden" name="queueItemId" value={item._id} />
            <button disabled={item.status === "PUBLISHED" || item.status === "CANCELLED"} className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50">Cancel</button>
          </form>
        </div>
      </div>
      <p className="text-[var(--muted)]">SEO {item.seoPassed ? "pass" : "pending"} - facts {item.factCheckPassed ? "pass" : "pending"} - images {item.imagesReady ? "ready" : "pending"} - plagiarism {item.plagiarismScore ?? "pending"}</p>
      {!postPublishable ? <p className="mt-1 text-red-700">Linked post is not publishable. Create a fresh automation run instead.</p> : null}
      {item.lastError ? <p className="mt-1 text-red-700">{item.lastError}</p> : null}
      <form action={scheduleQueueItemAction} className="mt-3 flex flex-wrap items-end gap-2">
        <input type="hidden" name="queueItemId" value={item._id} />
        <label className="grid gap-1 font-bold">Schedule time<input type="datetime-local" name="scheduledFor" className="rounded border border-[var(--line)] px-3 py-2" /></label>
        <button disabled={!postPublishable || terminal} className="rounded-md border border-[var(--line)] px-3 py-2 text-xs font-bold disabled:opacity-50">Schedule</button>
      </form>
    </div>;
  };
  return (
    <>
      <h1 className="text-4xl font-black">Publishing Queue</h1>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <div className="grid gap-3">
          {activeQueue.length ? activeQueue.map(renderQueueItem) : <p className="text-sm text-[var(--muted)]">No active publishing queue items.</p>}
        </div>
      </section>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Recent Queue History</h2>
        <div className="mt-4 grid gap-3">
          {history.length ? history.slice(0, 10).map(renderQueueItem) : <p className="text-sm text-[var(--muted)]">No published or cancelled queue history yet.</p>}
        </div>
      </section>
    </>
  );
}
