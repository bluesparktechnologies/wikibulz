"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, Bot, FileText, Image, Link2, Mail, Menu, Newspaper, ShieldCheck, Tags, Users, X } from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: Activity },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/automation", label: "Automation", icon: Bot },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/authors", label: "Authors", icon: Users },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/mail", label: "Mail", icon: Mail },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/seo", label: "SEO", icon: ShieldCheck },
  { href: "/admin/redirects", label: "Redirects", icon: Link2 },
  { href: "/admin/404s", label: "404s", icon: Link2 },
  { href: "/admin/technical", label: "Technical", icon: Activity },
  { href: "/admin/users", label: "Users", icon: Users },
];

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return <nav className="mt-8 grid gap-2">{nav.map((item) => <Link key={item.href} href={item.href} onClick={onNavigate} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-[#d7e5df] hover:bg-white/10"><item.icon size={17} />{item.label}</Link>)}</nav>;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  if (pathname.endsWith("/login")) return <>{children}</>;
  return <div className="min-h-screen bg-[#eef4f1]">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--line)] bg-[#10251f] p-5 text-white md:block">
      <Link href="/admin" className="flex items-center gap-2 text-xl font-black"><Newspaper size={22} />WikiBulz CMS</Link>
      <Navigation />
    </aside>
    <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--line)] bg-[#10251f] px-4 text-white md:hidden">
      <Link href="/admin" className="flex items-center gap-2 font-black"><Newspaper size={20} />WikiBulz CMS</Link>
      <button type="button" aria-label="Open admin menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)} className="rounded-md p-2 hover:bg-white/10"><Menu size={22} /></button>
    </div>
    {menuOpen ? <><button type="button" aria-label="Close admin menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-black/40 md:hidden" /><aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto bg-[#10251f] p-5 text-white shadow-xl md:hidden"><div className="flex items-center justify-between"><Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-xl font-black"><Newspaper size={22} />WikiBulz CMS</Link><button type="button" aria-label="Close admin menu" onClick={() => setMenuOpen(false)} className="rounded-md p-2 hover:bg-white/10"><X size={22} /></button></div><Navigation onNavigate={() => setMenuOpen(false)} /></aside></> : null}
    <main className="pt-16 md:pl-64 md:pt-0"><div className="mx-auto max-w-6xl px-5 py-8">{children}</div></main>
  </div>;
}

export function Metric({ label, value, caption }: { label: string; value: string; caption: string }) { return <div className="rounded-lg border border-[var(--line)] bg-white p-5"><p className="text-sm font-semibold text-[var(--muted)]">{label}</p><p className="mt-2 text-3xl font-black">{value}</p><p className="mt-2 text-xs text-[#617269]">{caption}</p></div>; }
