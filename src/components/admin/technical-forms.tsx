"use client";

import { useActionState } from "react";
import { invalidateCacheAction, revalidateRouteAction, type TechnicalActionState } from "@/app/admin/technical/actions";

const initialState: TechnicalActionState = { ok: false, message: "" };

function Message({ state }: { state: TechnicalActionState }) {
  return state.message ? <p className={state.ok ? "text-sm text-green-700" : "text-sm text-red-700"}>{state.message}</p> : null;
}

export function RevalidationForm() {
  const [state, action, pending] = useActionState(revalidateRouteAction, initialState);
  return <form action={action} className="grid gap-3 rounded-lg border border-[var(--line)] bg-white p-5"><h2 className="text-xl font-black">Manual Revalidation</h2><input name="path" placeholder="/investing/best-index-funds" className="rounded border border-[var(--line)] px-3 py-2"/><Message state={state}/><button disabled={pending} className="w-fit rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Revalidate</button></form>;
}

export function CacheInvalidateForm() {
  const [state, action, pending] = useActionState(invalidateCacheAction, initialState);
  return <form action={action} className="grid gap-3 rounded-lg border border-[var(--line)] bg-white p-5"><h2 className="text-xl font-black">Cache Invalidation</h2><input name="key" placeholder="post:best-index-funds" className="rounded border border-[var(--line)] px-3 py-2"/><Message state={state}/><button disabled={pending} className="w-fit rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">Delete Key</button></form>;
}

