import Link from "next/link";
import { AutomationActions } from "@/components/admin/automation-actions";
import { AutomationSettingsForm } from "@/components/admin/automation-settings-form";
import { Metric } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/guards";
import { getAutomationRuntimeSummary, getQueueSummary } from "@/modules/autoblog/jobs/queues";
import { getPipelineStages } from "@/modules/autoblog/orchestrator/pipeline";
import { getAutomationDashboard } from "@/modules/autoblog/repositories/automation.repository";

export default async function AutomationPage() {
  await requireRole("seo");
  const [dashboard, queues, runtime] = await Promise.all([getAutomationDashboard(), getQueueSummary(), getAutomationRuntimeSummary()]);
  const settings = dashboard.settings;
  const budget = dashboard.budget as { dailyCost: number; monthlyCost: number; hardStop: boolean };
  const runs = dashboard.runs as Array<{ _id: string; status: string; currentStage: string; dryRun: boolean; updatedAt: string }>;
  const providers = dashboard.providers as Array<{ provider: string; state: string; message?: string; checkedAt?: string }>;
  const notifications = dashboard.notifications as Array<{ _id: string; severity: string; message: string; createdAt: string }>;
  const keywords = dashboard.keywords as Array<{ _id: string; keyword: string; opportunityScore: number; intent: string; status: string }>;
  const providerBlockers = providers.filter((provider) => ["DOWN", "CONFIGURATION_REQUIRED"].includes(provider.state));
  const readinessIssues = [
    !settings.enabled ? "Automation is disabled." : "",
    settings.dryRunMode ? "Dry Run is still ON, so production runs are blocked." : "",
    !runtime.redisConfigured ? "REDIS_URL is not configured." : "",
    runtime.redisConfigured && !runtime.redisReachable ? "Redis is configured but not reachable." : "",
    runtime.redisReachable && runtime.workerHeartbeatStale ? "Autoblog worker heartbeat is missing or stale." : "",
    providerBlockers.length ? `${providerBlockers.length} provider(s) need attention.` : "",
  ].filter(Boolean);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Autonomous Organic Growth</p>
          <h1 className="mt-2 text-4xl font-black">Automation Control Center</h1>
          <p className="mt-2 text-[var(--muted)]">Safe dry-run first. The system plans, checks, and queues work before anything can publish.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["/admin/automation/topic-map", "Topic Map"],
            ["/admin/automation/calendar", "Calendar"],
            ["/admin/automation/queue", "Queue"],
            ["/admin/automation/prompts", "Prompts"],
            ["/admin/automation/providers", "Providers"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-bold">
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-4">
        <Metric label="Mode" value={settings.mode} caption={settings.enabled ? "Automation enabled" : "Automation disabled"} />
        <Metric label="Dry Run" value={settings.dryRunMode ? "ON" : "OFF"} caption={settings.autoPublish ? "Auto publish enabled" : "Auto publish disabled"} />
        <Metric label="News Discovery" value={settings.useNewsDiscovery ? "ON" : "OFF"} caption={settings.useNewsDiscovery ? "Uses internet news topics" : "Keyword-only evergreen mode"} />
        <Metric label="Min Opportunity" value={String(settings.minimumOpportunityScore)} caption="Required before planning content" />
        <Metric label="Backlog Target" value={String(settings.minimumReadyBacklog)} caption="Minimum ready articles" />
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <Metric label="Daily Cost" value={`$${budget.dailyCost.toFixed(2)}`} caption={`Limit $${settings.dailyAIBudget}`} />
        <Metric label="Monthly Cost" value={`$${budget.monthlyCost.toFixed(2)}`} caption={`Limit $${settings.monthlyAIBudget}`} />
        <Metric label="Budget Guard" value={budget.hardStop ? "PAUSED" : "OK"} caption="Automation pauses on hard limits" />
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <Metric label="Redis" value={runtime.redisReachable ? "ONLINE" : runtime.redisConfigured ? "OFFLINE" : "MISSING"} caption="Queue backend" />
        <Metric label="Worker" value={!runtime.workerHeartbeatStale ? "RUNNING" : "NOT SEEN"} caption={runtime.workerHeartbeatAt ? `Last heartbeat ${new Date(runtime.workerHeartbeatAt).toLocaleString()}` : "Run npm run jobs:autoblog-worker"} />
        <Metric label="Readiness" value={readinessIssues.length ? "ACTION NEEDED" : "READY"} caption={readinessIssues.length ? readinessIssues[0] : "Production controls are available"} />
      </div>

      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Production Readiness</h2>
        {readinessIssues.length ? (
          <div className="mt-4 grid gap-2">
            {readinessIssues.map((issue) => <p key={issue} className="rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm font-bold text-yellow-900">{issue}</p>)}
          </div>
        ) : <p className="mt-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-800">Ready for production automation runs. Keep the worker and scheduled publisher running in your hosting platform.</p>}
      </section>

      <AutomationActions />
      <AutomationSettingsForm settings={settings} siteProfile={dashboard.siteProfile} editorialProfile={dashboard.editorialProfile} />

      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Provider Health</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {providers.length ? providers.map((provider) => (
            <div key={provider.provider} className="rounded border border-[var(--line)] p-3">
              <p className="font-bold">{provider.provider}</p>
              <p className="text-sm text-[var(--muted)]">{provider.state} - {provider.message ?? "No message"}</p>
            </div>
          )) : <p className="text-sm text-[var(--muted)]">No provider health checks yet.</p>}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Pipeline</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {getPipelineStages().map((item) => (
            <p key={item.stage} className="rounded border border-[var(--line)] px-3 py-2 text-sm">
              <strong>{item.stage}</strong> - {item.queue}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Queues</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr><th className="p-3">Queue</th><th>Configured</th><th>Waiting</th><th>Active</th><th>Failed</th><th>Delayed</th></tr>
            </thead>
            <tbody>
              {queues.map((queue) => (
                <tr key={queue.name} className="border-t border-[var(--line)]">
                  <td className="p-3 font-bold">{queue.name}</td>
                  <td>{queue.configured ? "yes" : "Redis required"}</td>
                  <td>{queue.waiting}</td>
                  <td>{queue.active}</td>
                  <td>{queue.failed}</td>
                  <td>{queue.delayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Recent Runs</h2>
        {runs.length ? runs.map((run) => (
          <p key={run._id} className="mt-3 text-sm text-[var(--muted)]">
            <Link href={`/admin/automation/runs/${run._id}`} className="font-bold text-[var(--brand)]">{run.status}</Link> - {run.currentStage} - dry run {run.dryRun ? "yes" : "no"}
          </p>
        )) : <p className="mt-3 text-sm text-[var(--muted)]">No automation runs yet.</p>}
      </section>

      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Top Keywords</h2>
        {keywords.length ? keywords.map((keyword) => (
          <p key={keyword._id} className="mt-3 text-sm text-[var(--muted)]">{keyword.keyword} - score {keyword.opportunityScore} - {keyword.intent} - {keyword.status}</p>
        )) : <p className="mt-3 text-sm text-[var(--muted)]">No keywords imported yet.</p>}
      </section>

      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <h2 className="text-2xl font-black">Notifications</h2>
        {notifications.length ? notifications.map((item) => (
          <p key={item._id} className="mt-3 text-sm text-[var(--muted)]">{item.severity}: {item.message}</p>
        )) : <p className="mt-3 text-sm text-[var(--muted)]">No actionable automation notifications.</p>}
      </section>
    </>
  );
}
