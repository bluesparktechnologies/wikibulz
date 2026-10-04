import { describe, expect, it } from "vitest";
import type { Category } from "@/types/content";
import { buildCategoryTree, getCategoryFamilySlugs } from "./category-tree";

const category = (id: string, slug: string, parentCategory?: string): Category => ({
  id,
  name: slug,
  slug,
  description: "Category",
  indexStatus: "index",
  parentCategory,
});

describe("category tree", () => {
  const categories = [category("parent", "healthcare"), category("child", "dentists", "parent"), category("other", "education")];

  it("builds parent hover children in a stable tree", () => {
    const tree = buildCategoryTree(categories);
    expect(tree.map((node) => node.category.slug)).toEqual(["education", "healthcare"]);
    expect(tree.find((node) => node.category.slug === "healthcare")?.children.map((node) => node.category.slug)).toEqual(["dentists"]);
  });

  it("includes descendants in a parent category listing", () => {
    expect(getCategoryFamilySlugs(categories, "healthcare")).toEqual(new Set(["healthcare", "dentists"]));
    expect(getCategoryFamilySlugs(categories, "dentists")).toEqual(new Set(["dentists"]));
  });
});
