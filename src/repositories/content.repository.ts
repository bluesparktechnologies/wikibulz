import { cache } from "react";
import { categories, authors, posts, redirects, staticPages, countries, states, cities } from "@/lib/content/sample-data";
import { getCachedJson } from "@/lib/cache/cache";
import { categoryPath, matchesPostSlug } from "@/lib/seo/url";
import { getCategoryFamilySlugs } from "@/lib/seo/category-tree";
import { connectMongo } from "@/lib/db/mongoose";
import { AuthorModel, CategoryModel, CityModel, CountryModel, PageModel, PostModel, RedirectModel, StateModel, postCategoryPopulate, postLocationPopulate } from "@/models/schemas";
import { mapAuthor, mapCategory, mapCity, mapCountry, mapPost, mapRedirect, mapState, mapStaticPage } from "@/repositories/mappers";
import type { Author, Category, City, Country, LocationEntity, Post, RedirectRecord, StateRegion, StaticPage } from "@/types/content";

const published = (post: Post) => post.status === "published" && post.robotsIndex;
const byDate = (a: Post, b: Post) => Date.parse(b.publishedAt || b.updatedAt) - Date.parse(a.publishedAt || a.updatedAt);
const requireDatabaseInProduction = () => { if (process.env.NODE_ENV === "production") throw new Error("MongoDB is required for public content in production; sample content fallback is disabled."); };
const publicLookupLimit = 50000;

export const getPublishedPosts = cache(async (limit = 20, page = 1) => getCachedJson("posts:published:" + limit + ":" + page, async () => {
  const db = await connectMongo();
  if (!db) { requireDatabaseInProduction(); return posts.filter(published).sort(byDate).slice((page - 1) * limit, page * limit); }
  const docs = await PostModel.find({ status: "published", robotsIndex: true })
    .populate("author reviewer factCheckedBy tags")
    .populate(postCategoryPopulate)
    .populate(postLocationPopulate)
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(docs)).map(mapPost) as Post[];
}, 180, { origin: "mongodb", validate: (value) => Array.isArray(value) && value.every((post) => post && typeof post === "object" && (post as Post).status === "published" && (post as Post).robotsIndex === true) }));

export const getAllPostsForAdmin = cache(async (limit = 100, page = 1): Promise<Post[]> => {
  const db = await connectMongo();
  if (!db) { requireDatabaseInProduction(); return posts.sort(byDate).slice((page - 1) * limit, page * limit); }
  const docs = await PostModel.find({ status: { $ne: "trash" } })
    .populate("author reviewer factCheckedBy tags")
    .populate(postCategoryPopulate)
    .populate(postLocationPopulate)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(docs)).map(mapPost) as Post[];
});

export const getTrashedPostsForAdmin = cache(async (limit = 100, page = 1): Promise<Post[]> => {
  const db = await connectMongo();
  if (!db) { requireDatabaseInProduction(); return posts.filter((post) => post.status === "trash").sort(byDate).slice((page - 1) * limit, page * limit); }
  const docs = await PostModel.find({ status: "trash" })
    .populate("author reviewer factCheckedBy tags")
    .populate(postCategoryPopulate)
    .populate(postLocationPopulate)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(docs)).map(mapPost) as Post[];
});

export const getFeaturedPosts = cache(async () => (await getPublishedPosts(50)).filter((post) => post.featured).slice(0, 3));
export const getPopularPosts = cache(async () => (await getPublishedPosts(50)).sort((a, b) => b.views - a.views).slice(0, 5));
export const getEditorPicks = cache(async () => (await getPublishedPosts(50)).filter((post) => post.editorPick).slice(0, 4));
export const getCategories = cache(async (): Promise<Category[]> => {
  const db = await connectMongo();
  if (!db) { requireDatabaseInProduction(); return categories; }
  const docs = await CategoryModel.find({}).populate({ path: "parentCategory", populate: { path: "parentCategory" } }).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapCategory) as Category[];
});
export const getAuthors = cache(async (): Promise<Author[]> => {
  const db = await connectMongo();
  if (!db) { requireDatabaseInProduction(); return authors; }
  const docs = await AuthorModel.find({ status: "active" }).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapAuthor) as Author[];
});
export const getCountries = cache(async (): Promise<Country[]> => {
  const db = await connectMongo();
  if (!db) { requireDatabaseInProduction(); return countries; }
  const docs = await CountryModel.find({ status: "active" }).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapCountry) as Country[];
});
export const getStates = cache(async (): Promise<StateRegion[]> => {
  const db = await connectMongo();
  if (!db) { requireDatabaseInProduction(); return states; }
  const docs = await StateModel.find({ status: "active" }).populate("country").sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapState) as StateRegion[];
});
export const getCities = cache(async (): Promise<City[]> => {
  const db = await connectMongo();
  if (!db) { requireDatabaseInProduction(); return cities; }
  const docs = await CityModel.find({ status: "active" }).populate("country").populate({ path: "state", populate: { path: "country" } }).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapCity) as City[];
});
export const getPostBySlugs = cache(async (categorySlug: string, postSlug: string) => (await getPublishedPosts(publicLookupLimit)).find((post) => post.category.slug === categorySlug && matchesPostSlug(post, postSlug)) ?? null);
export const getPostByCategoryPath = cache(async (path: string[], postSlug: string) => {
  const requestedPath = path.join("/");
  return (await getPublishedPosts(publicLookupLimit)).find((post) => categoryPath(post.category).join("/") === requestedPath && matchesPostSlug(post, postSlug)) ?? null;
});
export const getPostBySlug = cache(async (slug: string) => (await getPublishedPosts(publicLookupLimit)).find((post) => matchesPostSlug(post, slug)) ?? null);
export const getPostById = cache(async (id: string) => (await getAllPostsForAdmin(200)).find((post) => post.id === id) ?? null);
export const getCategoryBySlug = cache(async (slug: string) => (await getCategories()).find((category) => category.slug === slug || category.categoryPath?.join("/") === slug) ?? null);
export const getChildCategories = cache(async (parentId: string) => (await getCategories()).filter((category) => category.parentCategory === parentId).sort((a, b) => a.name.localeCompare(b.name)));
export const getPostsByCategory = cache(async (slug: string, page = 1) => {
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug || item.categoryPath?.join("/") === slug);
  const canonicalSlug = category?.slug ?? slug.split("/").filter(Boolean).at(-1) ?? slug;
  const requestedPath = category?.categoryPath?.join("/") ?? slug;
  const categorySlugs = getCategoryFamilySlugs(categories, canonicalSlug);
  return (await getPublishedPosts(publicLookupLimit))
    .filter((post) => {
      const postCategoryPath = categoryPath(post.category);
      return categorySlugs.has(post.category.slug) || postCategoryPath.join("/") === requestedPath || postCategoryPath.includes(canonicalSlug);
    })
    .sort(byDate)
    .slice((page - 1) * 12, page * 12);
});
export const getAuthorBySlug = cache(async (slug: string) => (await getAuthors()).find((author) => author.slug === slug) ?? null);
export const getPostsByAuthor = cache(async (slug: string) => (await getPublishedPosts(publicLookupLimit)).filter((post) => post.author.slug === slug));
export const getLocationBySlug = cache(async (slug: string): Promise<{ type: "country"; location: Country } | { type: "state"; location: StateRegion } | { type: "city"; location: City } | null> => {
  const [country, state, city] = await Promise.all([
    getCountries().then((items) => items.find((item) => item.slug === slug) ?? null),
    getStates().then((items) => items.find((item) => item.slug === slug) ?? null),
    getCities().then((items) => items.find((item) => item.slug === slug) ?? null),
  ]);
  if (country) return { type: "country", location: country };
  if (state) return { type: "state", location: state };
  if (city) return { type: "city", location: city };
  return null;
});
export const getPostsByLocation = cache(async (location: LocationEntity, type: "country" | "state" | "city") => {
  return (await getPublishedPosts(publicLookupLimit)).filter((post) => {
    if (type === "country") return post.country?.id === location.id || post.state?.country.id === location.id || post.city?.country.id === location.id;
    if (type === "state") return post.state?.id === location.id || post.city?.state.id === location.id;
    return post.city?.id === location.id;
  }).sort(byDate);
});
export const getCategoriesByLocation = cache(async (location: LocationEntity, type: "country" | "state" | "city") => {
  const posts = await getPostsByLocation(location, type);
  const categoryIds = new Set(posts.map((post) => post.category.id));
  return (await getCategories()).filter((category) => categoryIds.has(category.id)).sort((a, b) => a.name.localeCompare(b.name));
});
export const getRelatedPosts = cache(async (post: Post) => (await getPublishedPosts(publicLookupLimit)).filter((candidate) => candidate.id !== post.id && (candidate.category.slug === post.category.slug || candidate.tags.some((tag) => post.tags.map((t) => t.slug).includes(tag.slug)) || post.relatedPosts.includes(candidate.id))).slice(0, 4));
export const searchPosts = cache(async (query: string) => { const needle = query.toLowerCase(); return (await getPublishedPosts(publicLookupLimit)).filter((post) => [post.title, post.excerpt, post.focusKeyword, post.category.name, ...post.secondaryKeywords].join(" ").toLowerCase().includes(needle)).slice(0, 20); });
export const getStaticPage = cache(async (slug: string): Promise<StaticPage | null> => {
  const db = await connectMongo();
  if (!db) { requireDatabaseInProduction(); return staticPages.find((page) => page.slug === slug) ?? null; }
  const doc = await PageModel.findOne({ slug }).lean();
  return doc ? mapStaticPage(JSON.parse(JSON.stringify(doc))) : null;
});
export const getStaticPages = cache(async (): Promise<StaticPage[]> => {
  const db = await connectMongo();
  if (!db) { requireDatabaseInProduction(); return staticPages; }
  const docs = await PageModel.find({ robotsIndex: true }).sort({ updatedAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapStaticPage) as StaticPage[];
});
export const getRedirects = cache(async (): Promise<RedirectRecord[]> => {
  const db = await connectMongo();
  if (!db) { requireDatabaseInProduction(); return redirects; }
  const docs = await RedirectModel.find({ active: true }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapRedirect) as RedirectRecord[];
});
