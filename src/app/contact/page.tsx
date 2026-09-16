import { BriefcaseBusiness, FileText, Mail, MessageCircle } from "lucide-react";
import { Footer, SiteHeader } from "@/components/blog/site-shell";
import { generateStaticMetadata } from "@/lib/seo/metadata";

export const metadata = generateStaticMetadata({ title: "Contact WikiBulz", description: "Contact WikiBulz for corrections, guide ideas, partnerships, and general questions.", path: "/contact", index: true });

const contactChannels = [
  {
    label: "Editorial",
    email: "editorial@wikibulz.com",
    subject: "Editorial enquiry for WikiBulz",
    description: "Send article corrections, source notes, story ideas, contributor pitches, or feedback about our coverage.",
    Icon: FileText,
  },
  {
    label: "Business & Partnerships",
    email: "contact@wikibulz.com",
    subject: "Partnership enquiry for WikiBulz",
    description: "For advertising, sponsorships, commercial partnerships, campaigns, or other business enquiries, include your company and timeline.",
    Icon: BriefcaseBusiness,
  },
  {
    label: "General Contact",
    email: "contact@wikibulz.com",
    subject: "General enquiry for WikiBulz",
    description: "Use this inbox for general questions, website feedback, newsletter help, or anything that does not fit the other channels.",
    Icon: MessageCircle,
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-wide text-[var(--accent)]">Contact</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">Talk to the WikiBulz team.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Choose the inbox that matches your message and we will route it to the right team.
          </p>
        </div>

        <section aria-labelledby="contact-channels" className="mt-10">
          <h2 id="contact-channels" className="sr-only">Contact channels</h2>
          <div className="grid gap-5 lg:grid-cols-3">
            {contactChannels.map(({ label, email, subject, description, Icon }) => (
              <article key={email} className="flex min-h-64 flex-col rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf5f1] text-[var(--brand)]" aria-hidden="true">
                    <Icon size={21} strokeWidth={2.2} />
                  </span>
                  <h2 className="text-xl font-black">{label}</h2>
                </div>
                <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{description}</p>
                <a
                  href={"mailto:" + email + "?subject=" + encodeURIComponent(subject)}
                  className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-[var(--brand)] underline decoration-[#a6d6c7] underline-offset-4 transition hover:text-[var(--brand-strong)]"
                >
                  <Mail size={16} aria-hidden="true" />
                  <span className="break-all">{email}</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 max-w-3xl border-t border-[var(--line)] pt-8">
          <h2 className="text-2xl font-black">Help us route your message quickly.</h2>
          <p className="mt-3 leading-7 text-[var(--muted)]">
            For article-related messages, include the article URL and the specific detail that needs attention. For business enquiries, include your company, website, campaign goal, and preferred timeline.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
