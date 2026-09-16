import { beforeEach, describe, expect, it, vi } from "vitest";

const subscribeToNewsletter = vi.hoisted(() => vi.fn());

vi.mock("@/repositories/newsletter.repository", () => ({ subscribeToNewsletter }));

import { POST } from "@/app/api/newsletter/route";

describe("newsletter subscription API", () => {
  beforeEach(() => {
    subscribeToNewsletter.mockReset();
  });

  it("normalizes valid emails before persistence", async () => {
    subscribeToNewsletter.mockResolvedValue({ persisted: true });

    const response = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "  Reader@Example.com " }),
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, message: "Subscribed." });
    expect(subscribeToNewsletter).toHaveBeenCalledWith("reader@example.com");
  });

  it("returns an unavailable response when MongoDB cannot persist the signup", async () => {
    subscribeToNewsletter.mockResolvedValue({ persisted: false });

    const response = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "reader@example.com" }),
    }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, message: "Newsletter signup is temporarily unavailable." });
  });

  it("rejects invalid email addresses", async () => {
    const response = await POST(new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    }));

    expect(response.status).toBe(400);
    expect(subscribeToNewsletter).not.toHaveBeenCalled();
  });
});
