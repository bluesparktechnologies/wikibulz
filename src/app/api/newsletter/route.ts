import { z } from "zod";
import { subscribeToNewsletter } from "@/repositories/newsletter.repository";

const schema = z.object({ email: z.string().trim().email().transform((email) => email.toLowerCase()) });

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return Response.json({ ok: false, message: "Enter a valid email." }, { status: 400 });
  try {
    const result = await subscribeToNewsletter(parsed.data.email);
    if (!result.persisted) return Response.json({ ok: false, message: "Newsletter signup is temporarily unavailable." }, { status: 503 });
    return Response.json({ ok: true, message: "Subscribed." });
  } catch {
    return Response.json({ ok: false, message: "Newsletter signup could not be saved. Please try again." }, { status: 500 });
  }
}
