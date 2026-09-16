import mongoose from "mongoose";
import { env } from "@/lib/validation/env";

type CachedConnection = { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalForMongoose = globalThis as typeof globalThis & { mongooseConnection?: CachedConnection };
const cached = globalForMongoose.mongooseConnection ?? { connection: null, promise: null };
globalForMongoose.mongooseConnection = cached;

export async function connectMongo() {
  if (!env.MONGODB_URI) return null;
  if (cached.connection?.connection.readyState === 1) return cached.connection;
  cached.promise ??= mongoose.connect(env.MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10_000,
  });
  try {
    cached.connection = await cached.promise;
    return cached.connection;
  } catch (error) {
    // Do not permanently cache a rejected connection promise. A transient
    // database/network failure must be recoverable on the next request.
    cached.promise = null;
    cached.connection = null;
    throw error;
  }
}
