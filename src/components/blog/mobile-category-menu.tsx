"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Topic = { label: string; href: string; children?: Topic[] };

export function MobileCategoryMenu({ topics }: { topics: Topic[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex size-10 items-center justify-center rounded-full text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-[var(--line)] bg-white p-2 shadow-xl">
          <Link href="/blog" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-bold text-[#273a33] transition hover:bg-[#edf5f1]">Blog</Link>
          {topics.map((topic) => (
            <div key={topic.href}>
              <Link href={topic.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-bold text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]">{topic.label}</Link>
              {topic.children?.map((child) => <Link key={child.href} href={child.href} onClick={() => setOpen(false)} className="block rounded-md px-6 py-2 text-sm font-semibold text-[#52635b] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]">{child.label}</Link>)}
            </div>
          ))}
          <div className="my-2 border-t border-[var(--line)]" />
          <Link href="/about" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-bold text-[#273a33] hover:bg-[#edf5f1]">About</Link>
          <Link href="/contact" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-bold text-[#273a33] hover:bg-[#edf5f1]">Contact</Link>
          <Link href="/newsletter" onClick={() => setOpen(false)} className="mt-2 block rounded-md bg-[var(--brand)] px-3 py-2.5 text-center text-sm font-black text-white">Subscribe</Link>
        </div>
      ) : null}
    </div>
  );
}
