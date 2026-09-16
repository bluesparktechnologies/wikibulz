import { permanentRedirect, redirect } from "next/navigation";
import { normalizePath, normalizeRedirectDestination } from "@/lib/seo/url";
import type { RedirectRecord } from "@/types/content";

export function validateRedirect(record: RedirectRecord, all: RedirectRecord[]) {
  const source = normalizePath(record.sourcePath);
  const destination = normalizePath(record.destinationPath);
  const warnings: string[] = [];
  if (source === destination) warnings.push("Redirect points to itself");
  const destinationRedirect = all.find((item) => normalizePath(item.sourcePath) === destination && item.active);
  if (destinationRedirect) warnings.push("Redirect chain detected; point directly to the final URL");
  let cursor = destinationRedirect;
  const seen = new Set([source]);
  while (cursor) {
    const next = normalizePath(cursor.destinationPath);
    if (seen.has(next)) { warnings.push("Redirect loop detected"); break; }
    seen.add(next);
    cursor = all.find((item) => normalizePath(item.sourcePath) === next && item.active);
  }
  return warnings;
}

export function followRedirect(record: RedirectRecord): never {
  const destination = normalizeRedirectDestination(record.destinationPath);
  if (record.statusCode === 301 || record.statusCode === 308) permanentRedirect(destination);
  redirect(destination);
}