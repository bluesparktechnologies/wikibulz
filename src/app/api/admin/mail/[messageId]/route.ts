import { requireMailAdmin } from "@/app/api/admin/mail/mail-auth";
import { getMessage, ZohoMailError } from "@/services/zoho-mail";

export const runtime = "nodejs";

function errorResponse(error: unknown) {
  if (error instanceof ZohoMailError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
  console.error("Admin mail detail request failed", error instanceof Error ? error.message : "unknown error");
  return Response.json({ error: "Mail service is temporarily unavailable." }, { status: 502 });
}

export async function GET(request: Request, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    const denied = await requireMailAdmin();
    if (denied) return denied;
    const { messageId } = await params;
    const url = new URL(request.url);
    const mailboxId = url.searchParams.get("mailboxId") || undefined;
    const markRead = url.searchParams.get("markRead") !== "false";
    return Response.json(await getMessage(mailboxId, messageId, markRead));
  } catch (error) { return errorResponse(error); }
}
