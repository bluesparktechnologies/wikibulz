import { describe, expect, it } from "vitest";
import { mapCategory } from "@/repositories/mappers";

describe("mapCategory", () => {
  it("builds a nested category path from populated parents", () => {
    const category = mapCategory({
      _id: "child",
      name: "Obzor SMI",
      slug: "obzor-smi",
      parentCategory: {
        _id: "parent",
        name: "InfoWar",
        slug: "infowar",
      },
    });

    expect(category.parentCategory).toBe("parent");
    expect(category.categoryPath).toEqual(["infowar", "obzor-smi"]);
  });
});
