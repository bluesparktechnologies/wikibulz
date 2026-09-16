import { requireRole } from "@/lib/auth/guards";
import { getPromptTemplates } from "@/modules/autoblog/repositories/automation.repository";

export default async function AutomationPromptsPage() {
  await requireRole("seo");
  const prompts = await getPromptTemplates() as Array<{ _id: string; name: string; taskType: string; version: number; model?: string; temperature?: number; active: boolean; updatedAt?: string }>;
  return (
    <>
      <h1 className="text-4xl font-black">Prompt Registry</h1>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead><tr><th className="p-3">Task</th><th>Name</th><th>Version</th><th>Model</th><th>Temperature</th><th>Active</th></tr></thead>
            <tbody>
              {prompts.map((prompt) => (
                <tr key={prompt._id} className="border-t border-[var(--line)]">
                  <td className="p-3 font-bold">{prompt.taskType}</td>
                  <td>{prompt.name}</td>
                  <td>{prompt.version}</td>
                  <td>{prompt.model ?? "default"}</td>
                  <td>{prompt.temperature ?? "default"}</td>
                  <td>{prompt.active ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!prompts.length ? <p className="mt-4 text-sm text-[var(--muted)]">No prompts yet. Use Sync Prompts from Automation dashboard.</p> : null}
        </div>
      </section>
    </>
  );
}
