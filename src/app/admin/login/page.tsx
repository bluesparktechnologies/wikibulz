import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() { return <main className="mx-auto max-w-md px-5 py-16"><h1 className="text-4xl font-black">Admin Login</h1><p className="mt-3 text-[var(--muted)]">Use a seeded admin account. The seed script creates one only when you provide a secure password through environment variables.</p><LoginForm /></main>; }
