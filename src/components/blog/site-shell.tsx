import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, Search } from "lucide-react";
import { MobileCategoryMenu } from "@/components/blog/mobile-category-menu";
import { getCategories } from "@/repositories/content.repository";
import { buildCategoryUrl } from "@/lib/seo/url";
import { buildCategoryTree, type CategoryTreeNode } from "@/lib/seo/category-tree";

const fallbackTopics = [
  { label: "Latest guides", href: "/blog" },
  { label: "How we rank", href: "/how-we-rank" },
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
        <span>{topic.label}</span><span aria-hidden="true">&rsaquo;</span>
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
    <header className="relative z-50 border-b border-[#d8e5de] bg-[#fbfdfb]/92 text-[var(--foreground)] shadow-[0_8px_24px_rgba(8,61,53,0.06)] backdrop-blur-xl">
      <div className="h-0.5 bg-[linear-gradient(90deg,#0f7667,#f3b661,#21a08d)]" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="WikiBulz home">
          <Image src="/logo-wikibulz.png" alt="WikiBulz" width={440} height={156} className="h-7 w-auto object-contain object-left md:h-8" preload />
        </Link>
        <nav aria-label="Main navigation" className="hidden shrink-0 items-center gap-1 rounded-full border border-[#d5e4dc] bg-white/85 p-0.5 shadow-sm md:flex">
          <div className="group relative">
            <Link href="/blog" className="rounded-full px-3 py-1.5 text-xs font-black text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]">
              Categories
            </Link>
            <div className="invisible absolute right-0 top-full z-50 mt-2 w-64 translate-y-2 rounded-lg border border-[var(--line)] bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100" role="menu">
              {blogTopics.map((topic) => <DesktopTopic key={topic.href} topic={topic} />)}
            </div>
          </div>
          <Link href="/how-we-rank" className="rounded-full px-3 py-1.5 text-xs font-black text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]">How We Rank</Link>
          <Link href="/about" className="rounded-full px-3 py-1.5 text-xs font-black text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]">About</Link>
          <Link href="/contact" className="rounded-full px-3 py-1.5 text-xs font-black text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]">Contact</Link>
          <Link href="/search" aria-label="Search" className="flex size-8 items-center justify-center rounded-full text-[#273a33] transition hover:bg-[#edf5f1] hover:text-[var(--brand)]">
            <Search size={17} />
          </Link>
          <Link href="/blog" className="rounded-full bg-[#f3b661] px-4 py-1.5 text-xs font-black text-[#10231e] shadow-sm transition hover:bg-[#ffd08a]">Explore Guides</Link>
        </nav>
        <div className="flex items-center gap-1.5 md:hidden">
          <Link href="/search" aria-label="Search" className="flex size-8 items-center justify-center rounded-full border border-[#d5e4dc] bg-white/80 text-[#273a33] shadow-sm transition hover:bg-[#edf5f1] hover:text-[var(--brand)]">
            <Search size={17} />
          </Link>
          <MobileCategoryMenu topics={blogTopics} />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-14 border-t border-[#173f37] bg-[#071f1b] text-white">
      <div className="h-1 bg-[linear-gradient(90deg,#f3b661,#21a08d,#f3b661)]" />
      <div className="mx-auto max-w-7xl px-5 py-8 md:py-10">
        <div className="grid gap-6 border-b border-white/10 pb-7 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <Link href="/" className="inline-block" aria-label="WikiBulz home">
              <Image src="/logo-wikibulz.png" alt="WikiBulz" width={440} height={156} className="h-9 w-auto object-contain object-left brightness-0 invert md:h-10" />
            </Link>
            <h2 className="mt-4 max-w-2xl text-2xl font-black leading-tight md:text-3xl">Local rankings, made easier to trust.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#c7d7d1]">Wikibulz helps readers compare local options with clear criteria, useful guides, and transparent editorial standards.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link href="/blog" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f3b661] px-4 py-2.5 text-sm font-black text-[#11231e] transition hover:bg-[#ffd08a]">Browse guides <ArrowUpRight size={16} /></Link>
            <Link href="/how-we-rank" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/10">How we rank</Link>
          </div>
        </div>

        <div className="grid gap-7 py-7 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fb2a6]">For readers</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#d4e2dc]">Use Wikibulz to understand what to compare, which questions to ask, and where to look next before choosing a local provider.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-[#f5bf72]">
              <span>Compare</span><span>/</span><span>Shortlist</span><span>/</span><span>Decide</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fb2a6]">Explore</p>
            <ul className="mt-3 space-y-2 text-sm text-[#d4e2dc]">
              <li><Link href="/blog" className="transition hover:text-white">Latest guides</Link></li>
              <li><Link href="/archive" className="transition hover:text-white">Archive</Link></li>
              <li><Link href="/how-we-rank" className="transition hover:text-white">How we rank</Link></li>
              <li><Link href="/editorial-policy" className="transition hover:text-white">Editorial policy</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fb2a6]">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-[#d4e2dc]">
              <li><Link href="/about" className="transition hover:text-white">About</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Contact</Link></li>
              <li><Link href="/write-for-us" className="transition hover:text-white">Write for us</Link></li>
              <li><Link href="/advertise" className="transition hover:text-white">Advertise</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8fb2a6]">Contact</p>
            <div className="mt-3 space-y-2 text-sm text-[#d4e2dc]">
              <a href="mailto:editorial@wikibulz.com" className="flex items-start gap-2 transition hover:text-white"><Mail size={16} className="mt-0.5 shrink-0 text-[#f3b661]" /><span>editorial@wikibulz.com</span></a>
              <a href="mailto:contact@wikibulz.com" className="flex items-start gap-2 transition hover:text-white"><Mail size={16} className="mt-0.5 shrink-0 text-[#f3b661]" /><span>contact@wikibulz.com</span></a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-[#9dbbb1] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} WikiBulz. Local rankings and discovery guides.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy-policy" className="transition hover:text-white">Privacy</Link>
            <Link href="/editorial-policy" className="transition hover:text-white">Editorial Policy</Link>
            <Link href="/corrections-policy" className="transition hover:text-white">Corrections</Link>
            <Link href="/terms" className="transition hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
