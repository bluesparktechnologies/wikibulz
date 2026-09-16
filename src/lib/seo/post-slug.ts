import slugify from "slugify";

/** Normalize an article slug without allowing it to become a path. */
export function normalizePostSlug(input: string) {
  return slugify(
    input.replace(/[\\/]+/g, "-").replace(/[^\w\s-]/g, ""),
    { lower: true, strict: true, trim: true },
  );
}
