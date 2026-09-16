"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submitLogin(formData: FormData) {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/login-auth", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email")?.toString() ?? "",
          password: formData.get("password")?.toString() ?? "",
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setMessage(payload?.error ?? "Invalid credentials.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submitLogin} className="mt-6 grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5">
      <input name="email" type="email" placeholder="Email" className="rounded border border-[var(--line)] px-3 py-2" />
      <input name="password" type="password" placeholder="Password" className="rounded border border-[var(--line)] px-3 py-2" />
      {message ? <p className="text-sm text-red-700">{message}</p> : null}
      <button disabled={pending} className="rounded-md bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
