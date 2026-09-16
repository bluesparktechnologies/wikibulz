import { requireRole } from "@/lib/auth/guards";
import { getMailboxMetadata } from "@/services/zoho-mail";
import { MailClient } from "@/components/admin/mail-client";

export default async function MailAdminPage() {
  await requireRole("admin");
  return <MailClient initialMailboxes={getMailboxMetadata()} />;
}
