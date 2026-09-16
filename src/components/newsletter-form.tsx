"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => ({ message: "Please try again." }));
      setMessage(payload.message ?? (response.ok ? "Subscribed." : "Please try again."));
      if (response.ok) setEmail("");
    } catch {
      setMessage("Newsletter signup is temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={subscribe} className="mt-6 grid max-w-lg gap-3 sm:grid-cols-[1fr_auto]">
      <input
        name="email"
        type="email"
        required
        aria-label="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={"min-w-0 rounded-md px-4 py-3 " + (variant === "dark" ? "text-[#13201b]" : "border border-[var(--line)] bg-white text-[#13201b]")}
        placeholder="editor@example.com"
      />
      <button disabled={pending} className="rounded-md bg-[#d7a04b] px-5 py-3 text-sm font-black text-[#10251f] disabled:opacity-70">
        {pending ? "Saving..." : "Subscribe"}
      </button>
      {message ? <p className={"text-sm font-bold sm:col-span-2 " + (variant === "dark" ? "text-[#f4ead8]" : "text-[var(--brand-strong)]")}>{message}</p> : null}
    </form>
  );
}
