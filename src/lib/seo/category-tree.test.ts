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
  const categories = [category("parent", "infowar"), category("child", "obzor-smi", "parent"), category("other", "technology-news")];

  it("builds parent hover children in a stable tree", () => {
    const tree = buildCategoryTree(categories);
    expect(tree.map((node) => node.category.slug)).toEqual(["infowar", "technology-news"]);
    expect(tree[0].children.map((node) => node.category.slug)).toEqual(["obzor-smi"]);
  });

  it("includes descendants in a parent category listing", () => {
    expect(getCategoryFamilySlugs(categories, "infowar")).toEqual(new Set(["infowar", "obzor-smi"]));
    expect(getCategoryFamilySlugs(categories, "obzor-smi")).toEqual(new Set(["obzor-smi"]));
  });
});
