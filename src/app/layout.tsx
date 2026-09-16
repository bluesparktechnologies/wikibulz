import type { Metadata } from "next";
import "./globals.css";
import { seoConfig } from "@/config/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";

export const metadata: Metadata = { metadataBase: new URL(seoConfig.siteUrl), title: { default: seoConfig.siteName, template: seoConfig.titleTemplate }, description: seoConfig.defaultDescription, openGraph: { title: seoConfig.siteName, description: seoConfig.defaultDescription, url: seoConfig.siteUrl, siteName: seoConfig.siteName, type: "website", images: [{ url: "/icon.svg", alt: "WikiBulz" }] }, twitter: { card: "summary_large_image", title: seoConfig.siteName, description: seoConfig.defaultDescription, images: ["/icon.svg"] }, robots: seoConfig.robots };

export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" className="h-full antialiased"><body className="min-h-full"><JsonLd data={organizationSchema()} /><JsonLd data={websiteSchema()} />{children}</body></html>; }
