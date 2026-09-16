import { hashPassword } from "../src/lib/auth/session";
import { authors, categories, posts, redirects, staticPages, tags } from "../src/lib/content/sample-data";
import { connectMongo } from "../src/lib/db/mongoose";
import { AuthorModel, CategoryModel, PageModel, PostModel, RedirectModel, TagModel, UserModel } from "../src/models/schemas";

async function main() {
  const db = await connectMongo();
  if (!db) {
    console.log("MongoDB is not configured. Seed preview:");
    console.log(JSON.stringify({ authors: authors.length, categories: categories.length, tags: tags.length, posts: posts.length, pages: staticPages.length, redirects: redirects.length }, null, 2));
    return;
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    await UserModel.updateOne(
      { email: adminEmail.toLowerCase() },
      { email: adminEmail.toLowerCase(), name: "Site Admin", role: "admin", active: true, passwordHash: await hashPassword(adminPassword) },
      { upsert: true },
    );
  }

  const authorIds = new Map<string, string>();
  for (const author of authors) {
    const doc = await AuthorModel.findOneAndUpdate({ slug: author.slug }, author, { upsert: true, returnDocument: "after" });
    authorIds.set(author.id, String(doc._id));
  }

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const doc = await CategoryModel.findOneAndUpdate({ slug: category.slug }, category, { upsert: true, returnDocument: "after" });
    categoryIds.set(category.id, String(doc._id));
  }

  const tagIds = new Map<string, string>();
  for (const tag of tags) {
    const doc = await TagModel.findOneAndUpdate({ slug: tag.slug }, tag, { upsert: true, returnDocument: "after" });
    tagIds.set(tag.id, String(doc._id));
  }

  const postIds = new Map<string, string>();
  for (const post of posts) {
    const relatedPosts = post.relatedPosts.map((id) => postIds.get(id)).filter(Boolean);
    const manualInternalLinks = post.manualInternalLinks.map((id) => postIds.get(id)).filter(Boolean);
    const doc = await PostModel.findOneAndUpdate(
      { slug: post.slug },
      {
        ...post,
        author: authorIds.get(post.author.id),
        reviewer: post.reviewer ? authorIds.get(post.reviewer.id) : undefined,
        category: categoryIds.get(post.category.id),
        tags: post.tags.map((tag) => tagIds.get(tag.id)).filter(Boolean),
        relatedPosts,
        manualInternalLinks,
      },
      { upsert: true, returnDocument: "after" },
    );
    postIds.set(post.id, String(doc._id));
  }

  for (const post of posts) {
    await PostModel.updateOne(
      { slug: post.slug },
      {
        relatedPosts: post.relatedPosts.map((id) => postIds.get(id)).filter(Boolean),
        manualInternalLinks: post.manualInternalLinks.map((id) => postIds.get(id)).filter(Boolean),
      },
    );
  }

  for (const page of staticPages) await PageModel.findOneAndUpdate({ slug: page.slug }, page, { upsert: true });
  for (const record of redirects) await RedirectModel.findOneAndUpdate({ sourcePath: record.sourcePath }, record, { upsert: true });
  console.log("Seed completed. Admin created only if SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD were provided.");
}

main().then(() => process.exit(0)).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
