"use client";

import { useActionState } from "react";
import { saveProviderSettingAction, type AutomationActionState } from "@/app/admin/automation/actions";

const initialState: AutomationActionState = { ok: false, message: "" };

export function ProviderSettingForm({ provider, enabled, requiredForPublish }: { provider: string; enabled: boolean; requiredForPublish: boolean }) {
  const [state, action, pending] = useActionState(saveProviderSettingAction, initialState);
  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-4 text-sm">
      <input type="hidden" name="provider" value={provider} />
      <label className="font-bold"><input type="checkbox" name="enabled" defaultChecked={enabled} /> Enabled</label>
      <label className="font-bold"><input type="checkbox" name="requiredForPublish" defaultChecked={requiredForPublish} /> Required for publish</label>
      <button disabled={pending} className="rounded-md bg-[var(--brand)] px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{pending ? "Saving..." : "Save"}</button>
      {state.message ? <span className={state.ok ? "text-green-700" : "text-red-700"}>{state.message}</span> : null}
    </form>
  );
}
