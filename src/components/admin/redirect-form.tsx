"use client";

import { useActionState } from "react";
import { saveRedirectAction, type RedirectActionState } from "@/app/admin/redirects/actions";

const initialState: RedirectActionState = { ok: false, message: "" };

export function RedirectForm() {
  const [state, action, pending] = useActionState(saveRedirectAction, initialState);
  return (
    <form action={action} className="mt-8 grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5 md:grid-cols-[1fr_1fr_120px_120px_auto]">
      <label className="grid gap-2 text-sm font-bold">
        Source Path
        <input name="sourcePath" placeholder="/old-url" className="rounded border border-[var(--line)] px-3 py-2" />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Destination Path
        <input name="destinationPath" placeholder="/new-url" className="rounded border border-[var(--line)] px-3 py-2" />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Status
        <select name="statusCode" defaultValue="301" className="rounded border border-[var(--line)] px-3 py-2">
          {[301, 302, 307, 308].map((code) => <option key={code} value={code}>{code}</option>)}
        </select>
      </label>
      <label className="flex items-end gap-2 pb-3 text-sm font-bold">
        <input type="checkbox" name="active" defaultChecked /> Active
      </label>
      <div className="flex items-end">
        <button disabled={pending} className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
      {state.message ? <p className={state.ok ? "md:col-span-5 text-sm text-green-700" : "md:col-span-5 text-sm text-red-700"}>{state.message}</p> : null}
    </form>
  );
}

