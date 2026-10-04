import { CityModel, CountryModel, PageModel, PostModel, StateModel } from "@/models/schemas";

type RootSlugOwner = "post" | "page" | "country" | "state" | "city";

const reservedRootSlugs = new Set([
  "admin",
  "about",
  "advertise",
  "api",
  "archive",
  "author",
  "blog",
  "category",
  "contact",
  "corrections-policy",
  "editorial-policy",
  "how-we-rank",
  "login-auth",
  "newsletter",
  "privacy-policy",
  "resources",
  "search",
  "tags",
  "terms",
  "write-for-us",
  "sitemap.xml",
  "sitemap-authors.xml",
  "sitemap-categories.xml",
  "sitemap-locations.xml",
  "sitemap-pages.xml",
  "sitemap-posts-1.xml",
  "robots.txt",
  "icon.png",
]);

const models = {
  post: PostModel,
  page: PageModel,
  country: CountryModel,
  state: StateModel,
  city: CityModel,
};

export async function findRootSlugConflict(slug: string, owner: RootSlugOwner, id?: string) {
  if (reservedRootSlugs.has(slug)) return `/${slug} is reserved by the application.`;
  const checks = await Promise.all(Object.entries(models).map(async ([kind, model]) => {
    if (kind === owner && id) return model.findOne({ slug, _id: { $ne: id } }).select("_id").lean();
    if (kind === owner) return null;
    return model.findOne({ slug }).select("_id").lean();
  }));
  const conflictIndex = checks.findIndex(Boolean);
  if (conflictIndex === -1) return null;
  const conflictKind = Object.keys(models)[conflictIndex];
  return `/${slug} is already used by a ${conflictKind}. Choose a unique root slug.`;
}
