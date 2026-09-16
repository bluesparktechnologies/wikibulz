import { describe, expect, it } from "vitest";
import { parsePageParam } from "./pagination";

describe("pagination SEO guards", () => {
  it("defaults missing values to the first page", () => { expect(parsePageParam(undefined)).toBe(1); });
  it("rejects malformed and non-positive pages", () => { expect(parsePageParam("abc")).toBeNull(); expect(parsePageParam("0")).toBeNull(); expect(parsePageParam("-2")).toBeNull(); });
  it("accepts positive integer query values", () => { expect(parsePageParam("12")).toBe(12); expect(parsePageParam(["3"])).toBe(3); });
});