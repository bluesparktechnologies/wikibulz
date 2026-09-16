import Link from "next/link";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import type { ReactNode } from "react";

export type InfoPageSection = {
  title: string;
  body: string;
  items?: string[];
};

export function InfoPage({
  eyebrow,
  title,
  description,
  sections,
  cta,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: InfoPageSection[];
  cta?: { label: string; href: string };
  children?: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">{eyebrow}</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-6xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">{description}</p>
        {cta ? <Link href={cta.href} className="mt-7 inline-flex rounded-md bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white">{cta.label}</Link> : null}
        <div className="mt-10 grid gap-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-[var(--line)] bg-white p-6">
              <h2 className="text-2xl font-black">{section.title}</h2>
              <p className="mt-3 leading-7 text-[var(--muted)]">{section.body}</p>
              {section.items?.length ? (
                <ul className="mt-4 grid gap-2 text-sm font-semibold text-[#40544b] md:grid-cols-2">
                  {section.items.map((item) => <li key={item} className="rounded border border-[var(--line)] bg-[#f8faf9] px-3 py-2">{item}</li>)}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
        {children}
      </main>
      <Footer />
    </>
  );
}
