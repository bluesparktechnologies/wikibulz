"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Admin page render failed", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-black uppercase tracking-wide text-red-700">Admin page error</p>
      <h1 className="mt-2 text-2xl font-black">This admin page could not load</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        The page failed while loading admin data. Try again; if the problem continues, check the database connection and deployment logs.
      </p>
      {error.digest ? <p className="mt-3 text-xs text-[var(--muted)]">Error reference: {error.digest}</p> : null}
      <button type="button" onClick={() => reset()} className="mt-5 rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">
        Try again
      </button>
    </main>
  );
}
