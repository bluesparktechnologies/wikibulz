import { notFound } from "next/navigation";
import { cancelAutomationRunAction, retryAutomationRunAction } from "@/app/admin/automation/actions";
import { requireRole } from "@/lib/auth/guards";
import { getAutomationRunDetail } from "@/modules/autoblog/repositories/automation.repository";

export default async function AutomationRunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("seo");
  const { id } = await params;
  const detail = await getAutomationRunDetail(id);
  if (!detail?.run) notFound();
  const run = detail.run as { _id: string; status: string; currentStage: string; dryRun: boolean; stages: Array<{ name: string; status: string; attempts: number; error?: string; outputSummary?: string }> };
  const artifacts = detail.artifacts as Array<{ _id: string; stage: string; artifactType: string; title?: string; summary?: string; data?: Record<string, unknown> }>;
  const notifications = detail.notifications as Array<{ _id: string; severity: string; message: string }>;
  return (
    <>
      <h1 className="text-4xl font-black">Pipeline Inspector</h1>
      <p className="mt-2 text-[var(--muted)]">{run.status} - {run.currentStage} - dry run {run.dryRun ? "yes" : "no"}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <form action={retryAutomationRunAction}>
          <input type="hidden" name="runId" value={run._id} />
          <button className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Retry As Production Run</button>
        </form>
        <form action={cancelAutomationRunAction}>
          <input type="hidden" name="runId" value={run._id} />
          <button className="rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700">Cancel Run</button>
        </form>
      </div>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Stages</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {run.stages.map((stage) => (
            <div key={stage.name} className="rounded border border-[var(--line)] p-3 text-sm">
              <p className="font-bold">{stage.name}</p>
              <p className="text-[var(--muted)]">{stage.status} - attempts {stage.attempts}</p>
              {stage.error ? <p className="text-red-700">{stage.error}</p> : null}
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Artifacts</h2>
        <div className="mt-4 grid gap-3">
          {artifacts.length ? artifacts.map((artifact) => (
            <div key={artifact._id} className="rounded border border-[var(--line)] p-3 text-sm">
              <p className="font-bold">{artifact.stage} - {artifact.artifactType}</p>
              <p className="text-[var(--muted)]">{artifact.title ?? artifact.summary ?? "Stored output"}</p>
              {artifact.summary && artifact.title ? <p className="mt-1 text-[var(--muted)]">{artifact.summary}</p> : null}
              {artifact.data ? <details className="mt-2"><summary className="cursor-pointer font-bold text-[var(--brand)]">View data</summary><pre className="mt-2 max-h-80 overflow-auto rounded bg-[#f6f8f7] p-3 text-xs">{JSON.stringify(artifact.data, null, 2)}</pre></details> : null}
            </div>
          )) : <p className="text-sm text-[var(--muted)]">No stage artifacts yet.</p>}
        </div>
      </section>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Notifications</h2>
        {notifications.length ? notifications.map((item) => <p key={item._id} className="mt-3 text-sm text-[var(--muted)]">{item.severity}: {item.message}</p>) : <p className="mt-3 text-sm text-[var(--muted)]">No notifications for this run.</p>}
      </section>
    </>
  );
}
