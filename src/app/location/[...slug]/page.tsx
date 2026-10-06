import { notFound, permanentRedirect } from "next/navigation";
import { buildLocationUrl } from "@/lib/seo/url";
import { getLocationBySlug } from "@/repositories/content.repository";

type Props = { params: Promise<{ slug: string[] }> };

export const dynamic = "force-dynamic";

export default async function LegacyLocationPage({ params }: Props) {
  const segments = (await params).slug.filter(Boolean);
  const slug = segments.at(-1);
  if (!slug) notFound();

  const location = await getLocationBySlug(slug);
  if (!location) notFound();

  permanentRedirect(buildLocationUrl(location.location));
}
