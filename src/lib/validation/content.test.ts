import { describe, expect, it } from "vitest";
import { postSlugSchema } from "@/lib/validation/content";

describe("postSlugSchema", () => {
  it("converts slash-separated input into one article slug", () => {
    expect(postSlugSchema.parse("obzor-smi/111-razvedsluzhby-otkazalis-ot-lenovo")).toBe("obzor-smi-111-razvedsluzhby-otkazalis-ot-lenovo");
    expect(postSlugSchema.parse("arpit\\sharma/article")).toBe("arpit-sharma-article");
  });

  it("continues to normalize a valid single-segment post slug", () => {
    expect(postSlugSchema.parse("  Lenovo Security Update  ")).toBe("lenovo-security-update");
  });
});
