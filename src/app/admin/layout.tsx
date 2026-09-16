import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) { return <AdminShell>{children}</AdminShell>; }
