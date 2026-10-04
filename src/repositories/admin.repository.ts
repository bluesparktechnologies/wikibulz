import { authors, categories, cities, countries, states, staticPages, tags } from "@/lib/content/sample-data";
import { connectMongo } from "@/lib/db/mongoose";
import { AuthorModel, CategoryModel, CityModel, CountryModel, MediaAssetModel, PageModel, SeoRevisionModel, StateModel, TagModel, UserModel } from "@/models/schemas";
import { mapAuthor, mapCategory, mapCity, mapCountry, mapMedia, mapState, mapStaticPage, mapTag } from "@/repositories/mappers";
import type { Author, Category, City, Country, StateRegion, StaticPage, Tag, UserRole } from "@/types/content";

type UserDoc = { _id: unknown; email?: unknown; name?: unknown; role?: unknown; active?: unknown; createdAt?: unknown; updatedAt?: unknown };
type RevisionDoc = { _id: unknown; entityType?: unknown; entityId?: unknown; field?: unknown; previousValue?: unknown; nextValue?: unknown; changedBy?: unknown; createdAt?: unknown };

export type AdminUser = { id: string; email: string; name: string; role: UserRole; active: boolean; createdAt: string; updatedAt: string };
export type AdminMedia = { id: string; url: string; alt: string; width: number; height: number; caption?: string; credit?: string; fileSize?: number; mimeType?: string; provider: string; usageReferences: string[] };
export type SeoRevision = { id: string; entityType: string; entityId: string; field: string; previousValue?: string; nextValue?: string; changedBy?: string; createdAt: string };

const iso = (value: unknown) => value instanceof Date ? value.toISOString() : typeof value === "string" ? value : new Date().toISOString();
const str = (value: unknown) => typeof value === "string" ? value : "";
const roles: UserRole[] = ["admin", "editor", "author", "seo"];

export async function getAdminCategories(): Promise<Category[]> {
  const db = await connectMongo();
  if (!db) return categories;
  const docs = await CategoryModel.find({}).populate({ path: "parentCategory", populate: { path: "parentCategory" } }).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapCategory) as Category[];
}

export async function getAdminTags(): Promise<Tag[]> {
  const db = await connectMongo();
  if (!db) return tags;
  const docs = await TagModel.find({}).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapTag) as Tag[];
}

export async function getAdminAuthors(): Promise<Author[]> {
  const db = await connectMongo();
  if (!db) return authors;
  const docs = await AuthorModel.find({}).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapAuthor) as Author[];
}

export async function getAdminCountries(): Promise<Country[]> {
  const db = await connectMongo();
  if (!db) return countries;
  const docs = await CountryModel.find({}).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapCountry) as Country[];
}

export async function getAdminStates(): Promise<StateRegion[]> {
  const db = await connectMongo();
  if (!db) return states;
  const docs = await StateModel.find({}).populate("country").sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapState) as StateRegion[];
}

export async function getAdminCities(): Promise<City[]> {
  const db = await connectMongo();
  if (!db) return cities;
  const docs = await CityModel.find({}).populate("country").populate({ path: "state", populate: { path: "country" } }).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapCity) as City[];
}

export async function getAdminPages(): Promise<StaticPage[]> {
  const db = await connectMongo();
  if (!db) return staticPages;
  const docs = await PageModel.find({}).sort({ updatedAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs)).map(mapStaticPage) as StaticPage[];
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const db = await connectMongo();
  if (!db) return [];
  const docs = await UserModel.find({}).sort({ updatedAt: -1 }).lean<UserDoc[]>();
  return docs.map((doc) => ({
    id: String(doc._id),
    email: str(doc.email),
    name: str(doc.name),
    role: roles.includes(str(doc.role) as UserRole) ? (str(doc.role) as UserRole) : "author",
    active: typeof doc.active === "boolean" ? doc.active : true,
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
  }));
}

export async function getAdminMedia(): Promise<AdminMedia[]> {
  const db = await connectMongo();
  if (!db) return [];
  const docs = await MediaAssetModel.find({}).sort({ updatedAt: -1 }).limit(200).lean();
  return JSON.parse(JSON.stringify(docs)).map((doc: Record<string, unknown>) => {
    const media = mapMedia(doc);
    return {
      id: String(doc._id ?? ""),
      ...media,
      fileSize: typeof doc.fileSize === "number" ? doc.fileSize : undefined,
      mimeType: typeof doc.mimeType === "string" ? doc.mimeType : undefined,
      provider: typeof doc.provider === "string" ? doc.provider : "local",
      usageReferences: Array.isArray(doc.usageReferences) ? doc.usageReferences.map(String) : [],
    };
  });
}

export async function getSeoRevisions(limit = 100): Promise<SeoRevision[]> {
  const db = await connectMongo();
  if (!db) return [];
  const docs = await SeoRevisionModel.find({}).sort({ createdAt: -1 }).limit(limit).lean<RevisionDoc[]>();
  return docs.map((doc) => ({
    id: String(doc._id),
    entityType: str(doc.entityType),
    entityId: str(doc.entityId),
    field: str(doc.field),
    previousValue: str(doc.previousValue) || undefined,
    nextValue: str(doc.nextValue) || undefined,
    changedBy: str(doc.changedBy) || undefined,
    createdAt: iso(doc.createdAt),
  }));
}
