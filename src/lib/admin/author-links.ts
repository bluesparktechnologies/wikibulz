export function parseAuthorLinks(values: string[]) {
  if (values.length > 12) throw new Error("An author can have up to 12 profile links.");
  const links: string[] = [];
  const seen = new Set<string>();
  for (const raw of values) {
    const value = raw.trim();
    if (!value) continue;
    let url: URL;
    try { url = new URL(value); }
    catch { throw new Error("Profile links must be valid HTTPS URLs."); }
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Profile links must be valid HTTPS URLs.");
    if (seen.has(url.href)) continue;
    seen.add(url.href);
    links.push(url.href);
  }
  return links;
}
