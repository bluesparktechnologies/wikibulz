import type { Category } from "@/types/content";

export type CategoryTreeNode = {
  category: Category;
  children: CategoryTreeNode[];
};

const byName = (left: Category, right: Category) => left.name.localeCompare(right.name);

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const childrenByParent = new Map<string, Category[]>();

  for (const category of categories) {
    if (!category.parentCategory || !byId.has(category.parentCategory)) continue;
    const children = childrenByParent.get(category.parentCategory) ?? [];
    children.push(category);
    childrenByParent.set(category.parentCategory, children);
  }

  const buildNode = (category: Category, ancestors: Set<string>): CategoryTreeNode => {
    if (ancestors.has(category.id)) return { category, children: [] };
    const nextAncestors = new Set(ancestors).add(category.id);
    return {
      category,
      children: (childrenByParent.get(category.id) ?? []).sort(byName).map((child) => buildNode(child, nextAncestors)),
    };
  };

  return categories
    .filter((category) => !category.parentCategory || !byId.has(category.parentCategory))
    .sort(byName)
    .map((category) => buildNode(category, new Set()));
}

export function getCategoryFamilySlugs(categories: Category[], rootSlug: string): Set<string> {
  const root = categories.find((category) => category.slug === rootSlug);
  if (!root) return new Set([rootSlug]);

  const descendants = new Set<string>([root.id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const category of categories) {
      if (category.parentCategory && descendants.has(category.parentCategory) && !descendants.has(category.id)) {
        descendants.add(category.id);
        changed = true;
      }
    }
  }

  return new Set(categories.filter((category) => descendants.has(category.id)).map((category) => category.slug));
}
