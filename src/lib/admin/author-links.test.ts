import { describe, expect, it } from "vitest";
import { parseAuthorLinks } from "./author-links";

describe("author profile links", () => {
  it("accepts separate links and removes empty or duplicate rows", () => {
    expect(parseAuthorLinks(["https://example.com/profile", "", " https://example.com/profile ", "https://example.org/"]))
      .toEqual(["https://example.com/profile", "https://example.org/"]);
  });
  it("rejects unsafe URLs", () => {
    expect(() => parseAuthorLinks(["javascript:alert(1)"])).toThrow("HTTPS");
    expect(() => parseAuthorLinks(["http://example.com"])).toThrow("HTTPS");
    expect(() => parseAuthorLinks(["https://user:pass@example.com"])).toThrow("HTTPS");
  });
});
