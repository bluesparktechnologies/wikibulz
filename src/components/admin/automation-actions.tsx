"use client";

import { useActionState } from "react";
import { refreshProviderHealthAction, seedPromptsAction, startDryRunAction, startProductionRunAction, type AutomationActionState } from "@/app/admin/automation/actions";

const initialState: AutomationActionState = { ok: false, message: "" };
type AutomationFormAction = (state: AutomationActionState, formData: FormData) => Promise<AutomationActionState>;

function ActionButton({ action, label }: { action: AutomationFormAction; label: string }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className="grid gap-2 rounded-lg border border-[var(--line)] bg-white p-4"><button disabled={pending} className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{pending ? "Working..." : label}</button>{state.message ? <p className={state.ok ? "text-sm text-green-700" : "text-sm text-red-700"}>{state.message}</p> : null}</form>;
}

export function AutomationActions() {
  return <div className="mt-6 grid gap-4 md:grid-cols-4"><ActionButton action={refreshProviderHealthAction} label="Refresh Providers" /><ActionButton action={seedPromptsAction} label="Sync Prompts" /><ActionButton action={startDryRunAction} label="Start Dry Run" /><ActionButton action={startProductionRunAction} label="Start Production Run" /></div>;
}
