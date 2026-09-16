type LoginBucket = { attempts: number; resetAt: number };

const buckets = new Map<string, LoginBucket>();
const windowMs = 15 * 60 * 1000;
const maxAttempts = 8;

export function loginRateLimitKey(request: Request, email: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${forwarded || request.headers.get("x-real-ip") || "unknown"}:${email.toLowerCase()}`;
}

export function isLoginRateLimited(key: string) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { attempts: 1, resetAt: now + windowMs });
    return false;
  }
  current.attempts += 1;
  return current.attempts > maxAttempts;
}
