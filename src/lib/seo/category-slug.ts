import slugify from "slugify";

export function normalizeCategorySlug(input: string) {
  return input
    .split("/")
    .map((segment) => slugify(segment.replace(/[^\w\s-]/g, ""), { lower: true, strict: true, trim: true }))
    .filter(Boolean)
    .join("/");
}
