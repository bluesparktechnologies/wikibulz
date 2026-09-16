import { connectMongo } from "@/lib/db/mongoose";
import { NewsletterSubscriberModel } from "@/models/schemas";

export type NewsletterSubscriberRow = {
  id: string;
  email: string;
  source: string;
  status: "active" | "unsubscribed";
  createdAt: string;
  updatedAt: string;
};

function mapSubscriber(value: Record<string, unknown>): NewsletterSubscriberRow {
  return {
    id: String(value._id ?? value.id ?? ""),
    email: String(value.email ?? ""),
    source: String(value.source ?? "homepage"),
    status: value.status === "unsubscribed" ? "unsubscribed" : "active",
    createdAt: value.createdAt instanceof Date ? value.createdAt.toISOString() : String(value.createdAt ?? ""),
    updatedAt: value.updatedAt instanceof Date ? value.updatedAt.toISOString() : String(value.updatedAt ?? ""),
  };
}

export async function subscribeToNewsletter(email: string, source = "homepage") {
  const db = await connectMongo();
  if (!db) return { persisted: false as const };

  const subscriber = await NewsletterSubscriberModel.findOneAndUpdate(
    { email },
    { email, source, status: "active" },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  ).lean();

  return { persisted: true as const, subscriber: mapSubscriber(subscriber as unknown as Record<string, unknown>) };
}

export async function getNewsletterSubscribers() {
  const db = await connectMongo();
  if (!db) return { available: false as const, subscribers: [] as NewsletterSubscriberRow[] };

  const rows = await NewsletterSubscriberModel.find({}).sort({ createdAt: -1 }).lean();
  return { available: true as const, subscribers: rows.map((row) => mapSubscriber(row as unknown as Record<string, unknown>)) };
}
