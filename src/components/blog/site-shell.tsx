import Link from "next/link";
import { ArrowUpRight, Mail, Search } from "lucide-react";
import { MobileCategoryMenu } from "@/components/blog/mobile-category-menu";
import { getCategories } from "@/repositories/content.repository";
import { buildCategoryUrl } from "@/lib/seo/url";
import { buildCategoryTree, type CategoryTreeNode } from "@/lib/seo/category-tree";

const fallbackTopics = [
  { label: "AI & Cybersecurity", href: "/category/ai-cybersecurity" },
  { label: "Technical SEO", href: "/category/technical-seo" },
  { label: "Investing", href: "/category/investing" },
  { label: "Retirement", href: "/category/retirement" },
];

type NavigationTopic = { label: string; href: string; children?: NavigationTopic[] };
const CATEGORY_NAV_TIMEOUT_MS = 1500;

function toNavigationTopic(node: CategoryTreeNode): NavigationTopic {
  return { label: node.category.name, href: buildCategoryUrl(node.category), children: node.children.map(toNavigationTopic) };
}

async function getBlogTopics(): Promise<NavigationTopic[]> {
  try {
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Category navigation timed out")), CATEGORY_NAV_TIMEOUT_MS));
    return buildCategoryTree(await Promise.race([getCategories(), timeout])).map(toNavigationTopic);
  } catch {
    return fallbackTopics;
  }
}

function DesktopTopic({ topic }: { topic: NavigationTopic }) {
  if (!topic.children?.length) return <Link href={topic.href} className="block rounded-md px-3 py-2 text-sm font-bold text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]">{topic.label}</Link>;
  return (
    <div className="group/parent relative">
      <Link href={topic.href} className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-bold text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]" aria-haspopup="menu">
        <span>{topic.label}</span><span aria-hidden="true">›</span>
      </Link>
      <div className="invisible absolute left-full top-0 z-50 ml-2 w-56 -translate-x-2 rounded-lg border border-[var(--line)] bg-white p-2 opacity-0 shadow-xl transition group-hover/parent:visible group-hover/parent:translate-x-0 group-hover/parent:opacity-100 group-focus-within/parent:visible group-focus-within/parent:translate-x-0 group-focus-within/parent:opacity-100" role="menu">
        {topic.children.map((child) => <DesktopTopic key={child.href} topic={child} />)}
      </div>
    </div>
  );
}

export async function SiteHeader() {
  const blogTopics = await getBlogTopics();
  return (
    <header className="relative z-50 border-b border-[#dfe7e2] bg-white/95 text-[var(--foreground)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="min-w-0">
          <span className="block text-xl font-black tracking-tight text-[var(--brand-strong)] md:text-2xl">WikiBulz</span>
          <span className="mt-0.5 hidden text-xs font-semibold text-[var(--muted)] sm:block">Tech insights for a brighter tomorrow</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden shrink-0 items-center gap-2 md:flex md:gap-5">
          <div className="group relative">
            <Link href="/blog" className="rounded-full px-2 py-2 text-xs font-black text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)] md:text-sm">
              Blog
            </Link>
            <div className="invisible absolute right-0 top-full z-50 mt-3 w-64 translate-y-2 rounded-lg border border-[var(--line)] bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100" role="menu">
              {blogTopics.map((topic) => <DesktopTopic key={topic.href} topic={topic} />)}
            </div>
          </div>
          <Link href="/about" className="text-xs font-black text-[#273a33] transition hover:text-[var(--brand)] md:text-sm">About</Link>
          <Link href="/contact" className="text-xs font-black text-[#273a33] transition hover:text-[var(--brand)] md:text-sm">Contact</Link>
          <Link href="/search" aria-label="Search" className="flex size-10 items-center justify-center rounded-full text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]">
            <Search size={19} />
          </Link>
          <Link href="/newsletter" className="rounded-full bg-[var(--brand)] px-3 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-[var(--brand-strong)] md:px-5 md:text-sm">Subscribe</Link>
        </nav>
        <div className="flex items-center gap-1 md:hidden">
          <Link href="/search" aria-label="Search" className="flex size-10 items-center justify-center rounded-full text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]">
            <Search size={19} />
          </Link>
          <MobileCategoryMenu topics={blogTopics} />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[#245047] bg-[#0c2b26] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 md:py-16">
        <div className="flex flex-col gap-7 border-b border-[#28554c] pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Link href="/" className="text-2xl font-black tracking-tight hover:text-[#a6d6c7]">WikiBulz</Link>
            <p className="mt-3 text-sm leading-7 text-[#c9d8d1]">Daily technology coverage for readers who want clear context on AI, cybersecurity, software, cloud platforms, startups, SEO technology, and digital business.</p>
          </div>
          <Link href="/newsletter" className="inline-flex w-fit items-center gap-2 rounded-md bg-[#168575] px-4 py-3 text-sm font-black text-white transition hover:bg-[#1d9a87]">
            Get the weekly brief <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_.8fr_.8fr_1.35fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fb2a6]">Explore</p>
            <ul className="mt-4 space-y-3 text-sm text-[#d4e2dc]">
              <li><Link href="/blog" className="transition hover:text-white">Latest articles</Link></li>
              <li><Link href="/archive" className="transition hover:text-white">Archive</Link></li>
              <li><Link href="/tags" className="transition hover:text-white">Topics and tags</Link></li>
              <li><Link href="/resources" className="transition hover:text-white">Resources</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fb2a6]">Company</p>
            <ul className="mt-4 space-y-3 text-sm text-[#d4e2dc]">
              <li><Link href="/about" className="transition hover:text-white">About</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Contact</Link></li>
              <li><Link href="/write-for-us" className="transition hover:text-white">Write for us</Link></li>
              <li><Link href="/advertise" className="transition hover:text-white">Advertise</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fb2a6]">Policies</p>
            <ul className="mt-4 space-y-3 text-sm text-[#d4e2dc]">
              <li><Link href="/privacy-policy" className="transition hover:text-white">Privacy policy</Link></li>
              <li><Link href="/terms" className="transition hover:text-white">Terms and disclaimer</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fb2a6]">Contact</p>
            <div className="mt-4 space-y-3 text-sm text-[#d4e2dc]">
              <a href="mailto:editorial@wikibulz.com" className="flex items-start gap-2 transition hover:text-white"><Mail size={16} className="mt-0.5 shrink-0" /><span><span className="font-semibold text-white">Editorial</span><br />editorial@wikibulz.com</span></a>
              <a href="mailto:contact@wikibulz.com" className="flex items-start gap-2 transition hover:text-white"><Mail size={16} className="mt-0.5 shrink-0" /><span><span className="font-semibold text-white">Partnerships</span><br />contact@wikibulz.com</span></a>
              <a href="mailto:contact@wikibulz.com" className="flex items-start gap-2 transition hover:text-white"><Mail size={16} className="mt-0.5 shrink-0" /><span><span className="font-semibold text-white">General enquiries</span><br />contact@wikibulz.com</span></a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#28554c] pt-6 text-xs text-[#9dbbb1] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} WikiBulz. Clear explainers and practical guides.</p>
          <p>Made for curious readers and working teams.</p>
        </div>
      </div>
    </footer>
  );
}
