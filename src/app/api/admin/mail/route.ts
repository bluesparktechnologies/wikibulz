import { z } from "zod";
import { requireMailAdmin } from "@/app/api/admin/mail/mail-auth";
import { composeMessage, deleteMessage, listMessages, updateMessage, ZohoMailError } from "@/services/zoho-mail";

export const runtime = "nodejs";

const folderSchema = z.enum(["inbox", "starred", "sent", "drafts", "trash"]);
const mailboxIdSchema = z.string().regex(/^[a-z][a-z0-9_-]{0,31}$/).optional();
const updateSchema = z.object({ mailboxId: mailboxIdSchema, action: z.enum(["read", "unread", "star", "unstar", "trash", "restore"]), messageId: z.string().max(512) });
const composeSchema = z.object({ mailboxId: mailboxIdSchema, action: z.enum(["send", "draft", "reply"]).default("send"), to: z.string().trim().max(4000), cc: z.string().trim().max(4000).optional(), bcc: z.string().trim().max(4000).optional(), subject: z.string().max(998).optional(), content: z.string().max(2_000_000), messageId: z.string().max(512).optional(), inReplyTo: z.string().max(998).optional(), refHeader: z.string().max(10_000).optional() });

function errorResponse(error: unknown) {
  if (error instanceof ZohoMailError) return Response.json({ error: error.message, code: error.code }, { status: error.status });
  console.error("Admin mail request failed", error instanceof Error ? error.message : "unknown error");
  return Response.json({ error: "Mail service is temporarily unavailable." }, { status: 502 });
}

export async function GET(request: Request) {
  try {
    const denied = await requireMailAdmin();
    if (denied) return denied;
    const url = new URL(request.url);
    const mailboxId = url.searchParams.get("mailboxId") || undefined;
    const folder = folderSchema.parse(url.searchParams.get("folder") ?? "inbox");
    const page = Math.max(1, Math.min(1000, Number(url.searchParams.get("page") ?? "1") || 1));
    const query = (url.searchParams.get("q") ?? "").slice(0, 160);
    const field = (url.searchParams.get("field") ?? "entire").slice(0, 20);
    return Response.json(await listMessages(mailboxId, folder, page, query, field));
  } catch (error) { return errorResponse(error); }
}

export async function PUT(request: Request) {
  try {
    const denied = await requireMailAdmin();
    if (denied) return denied;
    await updateMessage(updateSchema.parse(await request.json()));
    return Response.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    const denied = await requireMailAdmin();
    if (denied) return denied;
    const url = new URL(request.url);
    const mailboxId = url.searchParams.get("mailboxId") || undefined;
    const messageId = url.searchParams.get("messageId") ?? "";
    const permanent = url.searchParams.get("permanent") === "true";
    if (!messageId) return Response.json({ error: "Invalid message reference." }, { status: 400 });
    await deleteMessage(mailboxId, messageId, permanent);
    return Response.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const denied = await requireMailAdmin();
    if (denied) return denied;
    const formData = await request.formData();
    const parsed = composeSchema.parse({
      action: formData.get("action")?.toString() ?? "send",
      to: formData.get("to")?.toString() ?? "",
      cc: formData.get("cc")?.toString() ?? "",
      bcc: formData.get("bcc")?.toString() ?? "",
      subject: formData.get("subject")?.toString() ?? "",
      content: formData.get("content")?.toString() ?? "",
      mailboxId: formData.get("mailboxId")?.toString() || undefined,
      messageId: formData.get("messageId")?.toString() || undefined,
      inReplyTo: formData.get("inReplyTo")?.toString() || undefined,
      refHeader: formData.get("refHeader")?.toString() || undefined,
    });
    const files = formData.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > 10) return Response.json({ error: "You can attach up to 10 files." }, { status: 400 });
    if (files.some((file) => file.size > 25 * 1024 * 1024)) return Response.json({ error: "Each attachment must be smaller than 25MB." }, { status: 400 });
    if (files.reduce((total, file) => total + file.size, 0) > 50 * 1024 * 1024) return Response.json({ error: "Attachments must be smaller than 50MB in total." }, { status: 400 });
    await composeMessage({ ...parsed, draft: parsed.action === "draft", action: parsed.action === "reply" ? "reply" : undefined, attachments: files });
    return Response.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
