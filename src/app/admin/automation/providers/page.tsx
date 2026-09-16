import { requireRole } from "@/lib/auth/guards";
import { ProviderSettingForm } from "@/components/admin/provider-setting-form";
import { getProviderSettings } from "@/modules/autoblog/repositories/automation.repository";

export default async function AutomationProvidersPage() {
  await requireRole("admin");
  const providers = await getProviderSettings() as Array<{ _id: string; provider: string; enabled: boolean; requiredForPublish: boolean; lastHealthState?: string; lastHealthMessage?: string; lastCheckedAt?: string }>;
  return (
    <>
      <h1 className="text-4xl font-black">Providers</h1>
      <section className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
        <div className="grid gap-3">
          {providers.length ? providers.map((provider) => (
            <div key={provider._id} className="rounded border border-[var(--line)] p-3">
              <p className="font-bold">{provider.provider}</p>
              <p className="text-sm text-[var(--muted)]">Enabled {provider.enabled ? "yes" : "no"} - Required {provider.requiredForPublish ? "yes" : "no"} - {provider.lastHealthState ?? "not checked"}</p>
              <p className="text-sm text-[var(--muted)]">{provider.lastHealthMessage ?? "No message"}</p>
              <ProviderSettingForm provider={provider.provider} enabled={provider.enabled} requiredForPublish={provider.requiredForPublish} />
            </div>
          )) : <p className="text-sm text-[var(--muted)]">Run provider health once to create provider settings.</p>}
        </div>
      </section>
    </>
  );
}
