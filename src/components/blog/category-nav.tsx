"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const categoryLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Cybersecurity", href: "/category/cybersecurity" },
  { label: "Technology News", href: "/category/technology-news" },
  { label: "AI", href: "/category/artificial-intelligence" },
  { label: "Technical SEO", href: "/category/technical-seo" },
  { label: "Investing", href: "/category/investing" },
  { label: "Retirement", href: "/category/retirement" },
];

function isActive(pathname: string, href: string) {
  if (href === "/blog") return pathname === "/blog";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CategoryNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Category navigation" className="sticky top-0 z-40 border-y border-[var(--line)] bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl overflow-x-auto px-5">
        <div className="flex min-w-max items-center gap-2 py-2.5">
          {categoryLinks.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={active
                  ? "rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-black text-white shadow-sm"
                  : "rounded-full px-4 py-2 text-sm font-bold text-[#33443c] transition hover:bg-[#edf5f1] hover:text-[var(--brand-strong)]"}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
