import { createHmac, timingSafeEqual } from "node:crypto";
import sanitizeHtml from "sanitize-html";
import { env } from "@/lib/validation/env";

const regionConfig = {
  US: { mail: "https://mail.zoho.com", accounts: "https://accounts.zoho.com" },
  EU: { mail: "https://mail.zoho.eu", accounts: "https://accounts.zoho.eu" },
  IN: { mail: "https://mail.zoho.in", accounts: "https://accounts.zoho.in" },
  AU: { mail: "https://mail.zoho.com.au", accounts: "https://accounts.zoho.com.au" },
  JP: { mail: "https://mail.zoho.jp", accounts: "https://accounts.zoho.jp" },
  CA: { mail: "https://mail.zohocloud.ca", accounts: "https://accounts.zohocloud.ca" },
  CN: { mail: "https://mail.zoho.com.cn", accounts: "https://accounts.zoho.com.cn" },
  AE: { mail: "https://mail.zoho.ae", accounts: "https://accounts.zoho.ae" },
  SA: { mail: "https://mail.zoho.sa", accounts: "https://accounts.zoho.sa" },
} as const;

type Region = keyof typeof regionConfig;
type ZohoPayload = { status?: { code?: number | string; description?: string }; data?: unknown; [key: string]: unknown };
type TokenCache = { accessToken: string; expiresAt: number };
type MessageReferencePayload = { mailboxId: string; folderId: string; messageId: string };

const SAFE_MAILBOX_ID = /^[a-z][a-z0-9_-]{0,31}$/;
const LEGACY_MAILBOX_ID = "default";

export type MailboxMetadata = { id: string; displayName: string; email: string };
export type ServerMailboxConfig = MailboxMetadata & {
  region: Region;
  accountId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export type MailFolderKey = "inbox" | "starred" | "sent" | "drafts" | "trash";
export type MailFolder = { id: string; name: string; type: string; unreadCount?: number };
export type MailMessage = {
  id: string;
  threadId?: string;
  folderId: string;
  subject: string;
  sender: string;
  fromAddress: string;
  toAddress: string;
  summary: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
};
export type MailAttachment = { id: string; name: string; size?: number; contentType?: string };
export type MailMessageDetail = MailMessage & {
  ccAddress: string;
  bccAddress: string;
  html: string;
  text: string;
  attachments: MailAttachment[];
  messageHeader?: string;
};

const globalForZoho = globalThis as typeof globalThis & {
  zohoMailTokens?: Map<string, TokenCache>;
};

export class ZohoMailError extends Error {
  constructor(message: string, public readonly status = 502, public readonly code?: string) {
    super(message);
    this.name = "ZohoMailError";
  }
}

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

function requiredString(value: unknown, field: string) {
  const result = textValue(value).trim();
  if (!result) throw new ZohoMailError(`Mailbox configuration is missing ${field}.`, 503, "INVALID_MAILBOX_CONFIG");
  return result;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseMailboxEntry(id: string, value: unknown): ServerMailboxConfig {
  if (!SAFE_MAILBOX_ID.test(id)) throw new ZohoMailError(`Invalid mailbox id '${id}'.`, 503, "INVALID_MAILBOX_ID");
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ZohoMailError(`Mailbox '${id}' has an invalid configuration.`, 503, "INVALID_MAILBOX_CONFIG");
  const row = value as Record<string, unknown>;
  const email = requiredString(row.email ?? row.mailAddress, "email");
  if (!isEmail(email)) throw new ZohoMailError(`Mailbox '${id}' has an invalid email address.`, 503, "INVALID_MAILBOX_CONFIG");
  const region = requiredString(row.region, "region").toUpperCase() as Region;
  if (!regionConfig[region]) throw new ZohoMailError(`Mailbox '${id}' has an unsupported Zoho region.`, 503, "INVALID_MAILBOX_REGION");
  return {
    id,
    displayName: requiredString(row.displayName ?? row.name ?? id, "displayName"),
    email,
    region,
    accountId: requiredString(row.accountId, "accountId"),
    clientId: requiredString(row.clientId, "clientId"),
    clientSecret: requiredString(row.clientSecret, "clientSecret"),
    refreshToken: requiredString(row.refreshToken, "refreshToken"),
  };
}

export function parseMailboxConfiguration(raw: string): ServerMailboxConfig[] {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new ZohoMailError("ZOHO_MAILBOXES_JSON is not valid JSON.", 503, "INVALID_MAILBOX_CONFIG");
  }
  const entries = Array.isArray(value)
    ? value.map((row) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) return ["", row] as const;
        const record = row as Record<string, unknown>;
        return [textValue(record.id), row] as const;
      })
    : value && typeof value === "object"
      ? Object.entries(value as Record<string, unknown>)
      : [];
  if (!entries.length) throw new ZohoMailError("ZOHO_MAILBOXES_JSON must define at least one mailbox.", 503, "INVALID_MAILBOX_CONFIG");
  const seen = new Set<string>();
  return entries.map(([id, row]) => {
    if (seen.has(id)) throw new ZohoMailError(`Mailbox id '${id}' is duplicated.`, 503, "DUPLICATE_MAILBOX_ID");
    seen.add(id);
    return parseMailboxEntry(id, row);
  });
}

function legacyMailbox(): ServerMailboxConfig | null {
  const values = [env.ZOHO_MAIL_REGION, env.ZOHO_CLIENT_ID, env.ZOHO_CLIENT_SECRET, env.ZOHO_REFRESH_TOKEN, env.ZOHO_ACCOUNT_ID, env.ZOHO_MAIL_ADDRESS];
  if (values.every(Boolean)) {
    return {
      id: LEGACY_MAILBOX_ID,
      displayName: "Primary mailbox",
      email: env.ZOHO_MAIL_ADDRESS!,
      region: env.ZOHO_MAIL_REGION as Region,
      accountId: env.ZOHO_ACCOUNT_ID!,
      clientId: env.ZOHO_CLIENT_ID!,
      clientSecret: env.ZOHO_CLIENT_SECRET!,
      refreshToken: env.ZOHO_REFRESH_TOKEN!,
    };
  }
  return null;
}

function getMailboxConfigs() {
  if (env.ZOHO_MAILBOXES_JSON?.trim()) return parseMailboxConfiguration(env.ZOHO_MAILBOXES_JSON);
  const mailbox = legacyMailbox();
  return mailbox ? [mailbox] : [];
}

export function mailboxMetadata(configs: readonly ServerMailboxConfig[]) {
  return configs.map(({ id, displayName, email }) => ({ id, displayName, email }));
}

export function getMailboxMetadata() {
  return mailboxMetadata(getMailboxConfigs());
}

export function resolveMailboxFromConfigs(configs: readonly ServerMailboxConfig[], mailboxId?: string) {
  if (!configs.length) throw new ZohoMailError("Zoho Mail is not configured.", 503, "NOT_CONFIGURED");
  const selectedId = mailboxId?.trim() || (configs.length === 1 ? configs[0].id : "");
  if (!selectedId || !SAFE_MAILBOX_ID.test(selectedId)) throw new ZohoMailError("A valid mailboxId is required.", 400, "INVALID_MAILBOX_ID");
  const mailbox = configs.find((item) => item.id === selectedId);
  if (!mailbox) throw new ZohoMailError("Mailbox is not available to this administrator.", 404, "MAILBOX_NOT_FOUND");
  return mailbox;
}

function resolveMailbox(mailboxId?: string) {
  return resolveMailboxFromConfigs(getMailboxConfigs(), mailboxId);
}

export function isZohoMailConfigured() {
  return getMailboxConfigs().length > 0;
}

export function getConfiguredMailAddress() {
  return getMailboxMetadata()[0]?.email ?? null;
}

function getReferenceSecret() {
  const secret = env.ZOHO_MAIL_REFERENCE_SECRET || env.JWT_SECRET;
  if (!secret) throw new ZohoMailError("Mail reference signing is not configured.", 503, "MAIL_REFERENCE_SECRET_MISSING");
  return secret;
}

function signReference(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function createMailboxMessageReference(mailboxId: string, folderId: string, messageId: string, secret = getReferenceSecret()) {
  if (!SAFE_MAILBOX_ID.test(mailboxId) || !/^\d+$/.test(folderId) || !/^\d+$/.test(messageId)) throw new ZohoMailError("Invalid mailbox message reference.", 400, "INVALID_MESSAGE_ID");
  const encodedPayload = Buffer.from(JSON.stringify({ mailboxId, folderId, messageId })).toString("base64url");
  return `v1.${encodedPayload}.${signReference(encodedPayload, secret)}`;
}

export function decodeMailboxMessageReference(reference: string, expectedMailboxId?: string, secret = getReferenceSecret()): MessageReferencePayload {
  const parts = reference.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") throw new ZohoMailError("Invalid mailbox message reference.", 400, "INVALID_MESSAGE_ID");
  const [, encodedPayload, signature] = parts;
  const expectedSignature = signReference(encodedPayload, secret);
  const validSignature = signature.length === expectedSignature.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  if (!validSignature) throw new ZohoMailError("Message reference is not valid for this mailbox.", 403, "MAILBOX_MESSAGE_MISMATCH");
  let payload: MessageReferencePayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as MessageReferencePayload;
  } catch {
    throw new ZohoMailError("Invalid mailbox message reference.", 400, "INVALID_MESSAGE_ID");
  }
  if (!SAFE_MAILBOX_ID.test(payload.mailboxId) || !/^\d+$/.test(payload.folderId) || !/^\d+$/.test(payload.messageId) || (expectedMailboxId && payload.mailboxId !== expectedMailboxId)) {
    throw new ZohoMailError("Message reference is not valid for this mailbox.", 403, "MAILBOX_MESSAGE_MISMATCH");
  }
  return payload;
}

function getTokenCache() {
  if (!globalForZoho.zohoMailTokens) globalForZoho.zohoMailTokens = new Map();
  return globalForZoho.zohoMailTokens;
}

async function getAccessToken(mailbox: ServerMailboxConfig, forceRefresh = false) {
  const cache = getTokenCache();
  const cached = cache.get(mailbox.id);
  if (!forceRefresh && cached && cached.expiresAt > Date.now() + 60_000) return cached.accessToken;
  const params = new URLSearchParams({ refresh_token: mailbox.refreshToken, client_id: mailbox.clientId, client_secret: mailbox.clientSecret, grant_type: "refresh_token" });
  const response = await fetch(`${regionConfig[mailbox.region].accounts}/oauth/v2/token?${params}`, { method: "POST", headers: { Accept: "application/json" }, cache: "no-store" });
  const payload = await response.json().catch(() => ({})) as { access_token?: string; expires_in?: number; error?: string };
  if (!response.ok || !payload.access_token) throw new ZohoMailError(`Zoho authorization failed for ${mailbox.displayName}.`, 502, payload.error);
  cache.set(mailbox.id, { accessToken: payload.access_token, expiresAt: Date.now() + Math.max(60, payload.expires_in ?? 3600) * 1000 });
  return payload.access_token;
}

async function zohoRequest(mailboxId: string | undefined, path: string, init: RequestInit = {}, retried = false) {
  const mailbox = resolveMailbox(mailboxId);
  const token = await getAccessToken(mailbox, retried);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Zoho-oauthtoken ${token}`);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  const response = await fetch(`${regionConfig[mailbox.region].mail}/api${path}`, { ...init, headers, cache: "no-store" });
  if (response.status === 401 && !retried) {
    await response.body?.cancel();
    return zohoRequest(mailbox.id, path, init, true);
  }
  return response;
}

async function zohoFetch(mailboxId: string | undefined, path: string, init: RequestInit = {}): Promise<{ response: Response; payload: ZohoPayload }> {
  const response = await zohoRequest(mailboxId, path, init);
  const text = await response.text();
  let payload: ZohoPayload = {};
  if (text) {
    try {
      payload = JSON.parse(text) as ZohoPayload;
    } catch {
      throw new ZohoMailError("Zoho Mail returned an invalid response.", 502, "INVALID_ZOHO_RESPONSE");
    }
  }
  const statusCode = Number(payload.status?.code ?? response.status);
  if (!response.ok || statusCode >= 400) throw new ZohoMailError("Zoho Mail rejected the request. Check the mailbox permissions and API scopes.", response.status === 401 ? 401 : 502, String(payload.status?.code ?? response.status));
  return { response, payload };
}

function dataArray(payload: ZohoPayload) {
  return Array.isArray(payload.data) ? payload.data as Record<string, unknown>[] : [];
}

function messageId(value: unknown) {
  const id = textValue(value);
  return /^\d+$/.test(id) ? id : "";
}

function normalizeFolder(row: Record<string, unknown>): MailFolder | null {
  const id = textValue(row.folderId ?? row.id);
  if (!/^\d+$/.test(id)) return null;
  const name = textValue(row.folderName ?? row.name, "Folder");
  const count = Number(row.unreadCount ?? row.unreadMailCount ?? row.unread);
  return { id, name, type: textValue(row.folderType ?? row.type).toLowerCase(), unreadCount: Number.isFinite(count) ? count : undefined };
}

export async function getFolders(mailboxId?: string) {
  const mailbox = resolveMailbox(mailboxId);
  const { payload } = await zohoFetch(mailbox.id, `/accounts/${mailbox.accountId}/folders`);
  return dataArray(payload).map(normalizeFolder).filter((folder): folder is MailFolder => Boolean(folder));
}

function folderMatches(folder: MailFolder, key: Exclude<MailFolderKey, "starred">) {
  const value = `${folder.name} ${folder.type}`.toLowerCase();
  return value.includes(key.slice(0, -1)) || (key === "drafts" && value.includes("draft")) || (key === "trash" && (value.includes("trash") || value.includes("bin")));
}

function pickFolder(folders: MailFolder[], key: Exclude<MailFolderKey, "starred">) {
  const folder = folders.find((item) => folderMatches(item, key));
  if (!folder) throw new ZohoMailError(`Zoho Mail folder '${key}' was not found.`, 502, "FOLDER_NOT_FOUND");
  return folder;
}

function isoDate(value: unknown) {
  if (value === undefined || value === null || value === "") return new Date().toISOString();
  const numeric = Number(value);
  const date = Number.isFinite(numeric) && numeric > 0 ? new Date(numeric < 1_000_000_000_000 ? numeric * 1000 : numeric) : new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizeMessage(row: Record<string, unknown>, mailboxId: string, fallbackFolderId: string): MailMessage | null {
  const rawId = messageId(row.messageId ?? row.id);
  const folderId = textValue(row.folderId, fallbackFolderId);
  if (!rawId || !/^\d+$/.test(folderId)) return null;
  const status = textValue(row.status).toLowerCase();
  const isRead = status === "read" || status === "1" || status === "true";
  const flag = textValue(row.flagid ?? row.flagId).toLowerCase();
  return {
    id: createMailboxMessageReference(mailboxId, folderId, rawId),
    threadId: messageId(row.threadId) || undefined,
    folderId,
    subject: textValue(row.subject, "(No subject)"),
    sender: textValue(row.sender ?? row.fromAddress, "Unknown sender"),
    fromAddress: textValue(row.fromAddress),
    toAddress: textValue(row.toAddress),
    summary: textValue(row.summary),
    date: isoDate(row.sentDateInGMT ?? row.receivedTime ?? row.receivedtime),
    isRead,
    isStarred: ["important", "info", "followup", "2", "1"].includes(flag),
    hasAttachment: textValue(row.hasAttachment ?? row.hasattachment) === "1" || row.hasAttachment === true,
  };
}

function quoteSearch(value: string) {
  return value.includes(" ") ? `"${value.replaceAll('"', "")}"` : value.replaceAll(" ", "");
}

export async function listMessages(mailboxId: string | undefined, key: MailFolderKey, page: number, query = "", field = "entire") {
  const mailbox = resolveMailbox(mailboxId);
  const folders = await getFolders(mailbox.id);
  const folder = key === "starred" ? undefined : pickFolder(folders, key);
  const limit = 25;
  const params = new URLSearchParams({ start: String((page - 1) * limit + 1), limit: String(limit), includeto: "true" });
  if (folder) params.set("folderId", folder.id);
  if (key === "starred") params.set("flagid", "2");
  let rows: Record<string, unknown>[];
  if (query.trim()) {
    const allowedFields = new Set(["entire", "sender", "to", "cc", "subject", "content", "fileName", "fileContent"]);
    const safeField = allowedFields.has(field) ? field : "entire";
    const searchKey = `${safeField}:${quoteSearch(query.trim())}${folder ? `::in:${quoteSearch(folder.name)}` : ""}`;
    const searchParams = new URLSearchParams({ searchKey, start: params.get("start")!, limit: params.get("limit")!, includeto: "true" });
    rows = dataArray((await zohoFetch(mailbox.id, `/accounts/${mailbox.accountId}/messages/search?${searchParams}`)).payload);
  } else {
    rows = dataArray((await zohoFetch(mailbox.id, `/accounts/${mailbox.accountId}/messages/view?${params}`)).payload);
  }
  const messages = rows.map((row) => normalizeMessage(row, mailbox.id, folder?.id ?? "")).filter((item): item is MailMessage => Boolean(item));
  return { messages, folders, page, pageSize: limit, hasMore: messages.length === limit, unreadCount: folder?.unreadCount ?? messages.filter((item) => !item.isRead).length, mailbox: { id: mailbox.id, displayName: mailbox.displayName, email: mailbox.email } };
}

export function sanitizeMailHtml(html: string) {
  return sanitizeHtml(html, { allowedTags: ["p", "br", "div", "span", "strong", "b", "em", "i", "u", "s", "blockquote", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "table", "thead", "tbody", "tr", "th", "td", "pre", "code", "a"], allowedAttributes: { a: ["href", "target", "rel", "title"] }, allowedSchemes: ["http", "https", "mailto"], transformTags: { a: (_tag, attrs) => ({ tagName: "a", attribs: { ...attrs, rel: "noopener noreferrer", target: "_blank" } }) } });
}

function sanitizeFileName(value: string) {
  return value.replace(/[\\/\0]/g, "_").replace(/[^a-z0-9 ._()\-[\]]/gi, "_").slice(0, 160) || "attachment";
}

function attachmentRows(payload: ZohoPayload) {
  if (Array.isArray(payload.data)) return payload.data as Record<string, unknown>[];
  if (!payload.data || typeof payload.data !== "object") return [];
  const data = payload.data as Record<string, unknown>;
  return Array.isArray(data.attachments) ? data.attachments as Record<string, unknown>[] : [];
}

function normalizeAttachments(payload: ZohoPayload) {
  return attachmentRows(payload).map((row): MailAttachment | null => {
    const id = textValue(row.attachmentId ?? row.id ?? row.attachmentID);
    if (!/^\d+$/.test(id)) return null;
    const attachment: MailAttachment = { id, name: sanitizeFileName(textValue(row.attachmentName ?? row.name, `attachment-${id}`)) };
    const size = Number(row.attachmentSize);
    const contentType = textValue(row.contentType ?? row.mimeType);
    if (Number.isFinite(size) && size > 0) attachment.size = size;
    if (contentType) attachment.contentType = contentType;
    return attachment;
  }).filter((item): item is MailAttachment => Boolean(item));
}

function messageHeader(payload?: ZohoPayload) {
  if (!payload?.data || typeof payload.data !== "object") return undefined;
  const data = payload.data as Record<string, unknown>;
  const content = data.headerContent;
  if (content && typeof content === "object") {
    const headers = content as Record<string, unknown>;
    const value = headers["Message-Id"] ?? headers["Message-ID"] ?? headers["message-id"];
    const header = Array.isArray(value) ? textValue(value[0]) : textValue(value);
    return header.trim() || undefined;
  }
  return textValue(content).match(/^Message-Id:\s*(.+)$/im)?.[1]?.trim() || undefined;
}

function referenceForMailbox(mailboxId: string | undefined, reference: string) {
  const mailbox = resolveMailbox(mailboxId);
  const payload = decodeMailboxMessageReference(reference, mailbox.id);
  return { mailbox, payload };
}

export async function getMessage(mailboxId: string | undefined, reference: string, markRead = true): Promise<MailMessageDetail> {
  const { mailbox, payload: referencePayload } = referenceForMailbox(mailboxId, reference);
  const base = `/accounts/${mailbox.accountId}/folders/${referencePayload.folderId}/messages/${referencePayload.messageId}`;
  const headerResult = zohoFetch(mailbox.id, `${base}/header?raw=false`).catch(() => null);
  const [contentResult, detailsResult, attachmentResult, header] = await Promise.all([
    zohoFetch(mailbox.id, `${base}/content?includeBlockContent=true`),
    zohoFetch(mailbox.id, `${base}/details`),
    zohoFetch(mailbox.id, `${base}/attachmentinfo?includeInline=false`),
    headerResult,
  ]);
  if (markRead) await updateMessage({ mailboxId: mailbox.id, action: "read", messageId: reference });
  const details = (detailsResult.payload.data && !Array.isArray(detailsResult.payload.data) ? detailsResult.payload.data : {}) as Record<string, unknown>;
  const content = (contentResult.payload.data && !Array.isArray(contentResult.payload.data) ? contentResult.payload.data : {}) as Record<string, unknown>;
  const message = normalizeMessage({ ...details, messageId: referencePayload.messageId, folderId: referencePayload.folderId, subject: details.subject ?? content.subject, fromAddress: details.fromAddress ?? content.fromAddress, toAddress: details.toAddress ?? content.toAddress, sender: details.sender ?? details.fromAddress, sentDateInGMT: details.sentDateInGMT ?? details.receivedTime }, mailbox.id, referencePayload.folderId);
  if (!message) throw new ZohoMailError("The message could not be read.", 502, "MALFORMED_MESSAGE");
  return { ...message, ccAddress: textValue(details.ccAddress ?? content.ccAddress), bccAddress: textValue(details.bccAddress ?? content.bccAddress), html: sanitizeMailHtml(textValue(content.content ?? content.html)), text: textValue(content.text ?? details.summary), attachments: normalizeAttachments(attachmentResult.payload), messageHeader: messageHeader(header?.payload) ?? (textValue(details.messageIdHeader ?? details.messageHeader ?? details.inReplyTo) || undefined) };
}

export async function getAttachment(mailboxId: string | undefined, reference: string, attachmentId: string) {
  const { mailbox, payload } = referenceForMailbox(mailboxId, reference);
  if (!/^\d+$/.test(attachmentId)) throw new ZohoMailError("Invalid attachment reference.", 400, "INVALID_ATTACHMENT_ID");
  const response = await zohoRequest(mailbox.id, `/accounts/${mailbox.accountId}/folders/${payload.folderId}/messages/${payload.messageId}/attachments/${attachmentId}`, { headers: { Accept: "application/octet-stream" } });
  if (!response.ok) {
    await response.body?.cancel();
    throw new ZohoMailError("Zoho Mail could not provide this attachment.", response.status === 401 ? 401 : 502, "ATTACHMENT_FETCH_FAILED");
  }
  return { response };
}

type UpdateInput = { mailboxId?: string; action: "read" | "unread" | "star" | "unstar" | "trash" | "restore"; messageId: string };
export async function updateMessage(input: UpdateInput) {
  const { mailbox, payload } = referenceForMailbox(input.mailboxId, input.messageId);
  if (input.action === "trash" || input.action === "restore") {
    const destination = pickFolder(await getFolders(mailbox.id), input.action === "trash" ? "trash" : "inbox");
    await zohoFetch(mailbox.id, `/accounts/${mailbox.accountId}/updatemessage`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "moveMessage", destfolderId: destination.id, messageId: [payload.messageId], isFolderSpecific: true, folderId: payload.folderId }) });
    return;
  }
  const body = input.action === "star" || input.action === "unstar"
    ? { mode: "setFlag", flagid: input.action === "star" ? "important" : "flag_not_set", messageId: [payload.messageId], isFolderSpecific: true, folderId: payload.folderId }
    : { mode: input.action === "read" ? "markAsRead" : "markAsUnread", messageId: [payload.messageId] };
  await zohoFetch(mailbox.id, `/accounts/${mailbox.accountId}/updatemessage`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

export async function deleteMessage(mailboxId: string | undefined, reference: string, permanent = false) {
  const { mailbox, payload } = referenceForMailbox(mailboxId, reference);
  await zohoFetch(mailbox.id, `/accounts/${mailbox.accountId}/folders/${payload.folderId}/messages/${payload.messageId}?expunge=${permanent ? "true" : "false"}`, { method: "DELETE" });
}

type ComposeInput = { mailboxId?: string; to: string; cc?: string; bcc?: string; subject?: string; content: string; draft?: boolean; action?: "reply"; messageId?: string; inReplyTo?: string; refHeader?: string; attachments?: File[] };
function validateRecipients(value: string) {
  return value.split(",").map((part) => part.trim()).filter(Boolean).every((part) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part));
}

export async function composeMessage(input: ComposeInput) {
  const mailbox = resolveMailbox(input.mailboxId);
  if (!input.to || !validateRecipients(input.to) || (input.cc && !validateRecipients(input.cc)) || (input.bcc && !validateRecipients(input.bcc))) throw new ZohoMailError("Enter valid recipient email addresses.", 400, "INVALID_RECIPIENT");
  let replyReference: MessageReferencePayload | undefined;
  if (input.action === "reply") {
    if (!input.messageId) throw new ZohoMailError("A valid message is required for a reply.", 400, "INVALID_REPLY_MESSAGE_ID");
    replyReference = decodeMailboxMessageReference(input.messageId, mailbox.id);
  }
  if (!input.content.trim() && !input.draft) throw new ZohoMailError("Email content cannot be empty.", 400, "EMPTY_CONTENT");
  const attachmentRefs: Array<{ attachmentName: string; attachmentPath: string; storeName: string }> = [];
  for (const file of input.attachments ?? []) {
    const body = new FormData();
    body.append("attach", file, sanitizeFileName(file.name));
    const result = await zohoFetch(mailbox.id, `/accounts/${mailbox.accountId}/messages/attachments?uploadType=multipart&isInline=false`, { method: "POST", body });
    const uploaded = dataArray(result.payload)[0];
    if (uploaded) attachmentRefs.push({ attachmentName: sanitizeFileName(textValue(uploaded.attachmentName, file.name)), attachmentPath: textValue(uploaded.attachmentPath), storeName: textValue(uploaded.storeName) });
  }
  const body: Record<string, unknown> = { fromAddress: mailbox.email, toAddress: input.to, ccAddress: input.cc || undefined, bccAddress: input.bcc || undefined, subject: input.subject || "", content: sanitizeMailHtml(input.content), mailFormat: "html" };
  if (attachmentRefs.length) body.attachments = attachmentRefs;
  if (input.draft) body.mode = "draft";
  if (input.action === "reply") body.action = "Reply";
  if (input.inReplyTo) body.inReplyTo = input.inReplyTo;
  if (input.refHeader) body.refHeader = input.refHeader;
  const path = replyReference ? `/accounts/${mailbox.accountId}/messages/${replyReference.messageId}` : `/accounts/${mailbox.accountId}/messages`;
  await zohoFetch(mailbox.id, path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
