import { requireMailAdmin } from "@/app/api/admin/mail/mail-auth";
import { getAttachment, ZohoMailError } from "@/services/zoho-mail";

export const runtime = "nodejs";

function errorResponse(error: unknown) {
  if (error instanceof ZohoMailError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
  console.error("Admin mail attachment request failed", error instanceof Error ? error.message : "unknown error");
  return Response.json({ error: "Attachment service is temporarily unavailable." }, { status: 502 });
}

export async function GET(request: Request, { params }: { params: Promise<{ messageId: string; attachmentId: string }> }) {
  try {
    const denied = await requireMailAdmin();
    if (denied) return denied;
    const { messageId, attachmentId } = await params;
    const mailboxId = new URL(request.url).searchParams.get("mailboxId") || undefined;
    const { response } = await getAttachment(mailboxId, messageId, attachmentId);
    const length = Number(response.headers.get("content-length") ?? "0");
    if (length > 50 * 1024 * 1024) return Response.json({ error: "Attachment is too large to download through the dashboard." }, { status: 413 });
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("content-type") ?? "application/octet-stream");
    headers.set("Content-Disposition", `attachment; filename="attachment-${attachmentId}"`);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Cache-Control", "private, no-store");
    return new Response(response.body, { status: response.status, headers });
  } catch (error) { return errorResponse(error); }
}
