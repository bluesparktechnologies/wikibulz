import { getMailboxMetadata, ZohoMailError } from "@/services/zoho-mail";
import { requireMailAdmin } from "@/app/api/admin/mail/mail-auth";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireMailAdmin();
  if (denied) return denied;
  try {
    return Response.json({ mailboxes: getMailboxMetadata() });
  } catch (error) {
    if (error instanceof ZohoMailError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
    console.error("Admin mailbox metadata request failed", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "Mailbox configuration is temporarily unavailable." }, { status: 503 });
  }
}
