"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Archive, ChevronLeft, ChevronRight, Download, FileText, Inbox, Mail as MailIcon, MailOpen, PenLine, RefreshCw, Search, Send, Star, Trash2, X } from "lucide-react";

type FolderKey = "inbox" | "starred" | "sent" | "drafts" | "trash";
type Folder = { id: string; name: string; unreadCount?: number };
type Mailbox = { id: string; displayName: string; email: string };
type Message = { id: string; threadId?: string; folderId: string; subject: string; sender: string; fromAddress: string; toAddress: string; summary: string; date: string; isRead: boolean; isStarred: boolean; hasAttachment: boolean };
type Detail = Message & { ccAddress: string; bccAddress: string; html: string; text: string; attachments: Array<{ id: string; name: string; size?: number; contentType?: string }>; messageHeader?: string };
type ComposeState = { to: string; cc: string; bcc: string; subject: string; content: string; messageId?: string; inReplyTo?: string; refHeader?: string };

const folders: Array<{ key: FolderKey; label: string; icon: typeof Inbox }> = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "starred", label: "Starred / Important", icon: Star },
  { key: "sent", label: "Sent", icon: Send },
  { key: "drafts", label: "Drafts", icon: FileText },
  { key: "trash", label: "Trash", icon: Trash2 },
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function errorText(value: unknown) { return value instanceof Error ? value.message : "Something went wrong. Try again."; }

export function MailClient({ initialMailboxes }: { initialMailboxes: Mailbox[] }) {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>(initialMailboxes);
  const [mailboxId, setMailboxId] = useState(initialMailboxes[0]?.id ?? "");
  const [folder, setFolder] = useState<FolderKey>("inbox");
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [folderRows, setFolderRows] = useState<Folder[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(initialMailboxes.length > 0);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [field, setField] = useState("entire");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<"send" | "draft" | "reply">("send");
  const [compose, setCompose] = useState<ComposeState>({ to: "", cc: "", bcc: "", subject: "", content: "" });
  const [composeError, setComposeError] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const composeInitializedRef = useRef(false);
  const configured = mailboxes.length > 0 && Boolean(mailboxId);
  const activeMailbox = mailboxes.find((item) => item.id === mailboxId) ?? mailboxes[0];

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/mailboxes", { cache: "no-store" }).then(async (response) => {
      const body = await response.json() as { error?: string; mailboxes?: Mailbox[] };
      if (!response.ok) throw new Error(body.error || "Unable to load mailboxes.");
      if (!active) return;
      const next = body.mailboxes ?? [];
      setMailboxes(next);
      setMailboxId((current) => next.some((item) => item.id === current) ? current : next[0]?.id ?? "");
    }).catch((reason) => { if (active) setError(errorText(reason)); });
    return () => { active = false; };
  }, []);

  const loadMessages = useCallback(async (silent = false) => {
    if (!configured) return;
    if (!silent) setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ mailboxId, folder, page: String(page), field });
      if (query) params.set("q", query);
      const response = await fetch(`/api/admin/mail?${params}`, { cache: "no-store" });
      const body = await response.json() as { error?: string; messages?: Message[]; folders?: Folder[]; hasMore?: boolean; unreadCount?: number };
      if (!response.ok) throw new Error(body.error || "Unable to load mailbox.");
      setMessages(body.messages ?? []); setFolderRows(body.folders ?? []); setHasMore(Boolean(body.hasMore)); setUnreadCount(body.unreadCount ?? 0);
    } catch (reason) { setError(errorText(reason)); } finally { if (!silent) setLoading(false); }
  }, [configured, field, folder, mailboxId, page, query]);

  // Mailbox state is loaded from the server whenever the folder/search inputs change.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadMessages(); }, [loadMessages]);
  useEffect(() => { if (!configured) return; const timer = window.setInterval(() => { if (document.visibilityState === "visible") void loadMessages(true); }, 60_000); return () => window.clearInterval(timer); }, [configured, loadMessages]);
  useEffect(() => {
    if (!composeOpen) { composeInitializedRef.current = false; return; }
    if (!composeInitializedRef.current && editorRef.current) { editorRef.current.innerHTML = compose.content; composeInitializedRef.current = true; }
  }, [composeOpen, compose.content]);

  async function openMessage(message: Message) {
    setError(""); setSelected(null);
    try {
      const response = await fetch(`/api/admin/mail/${encodeURIComponent(message.id)}?mailboxId=${encodeURIComponent(mailboxId)}`, { cache: "no-store" });
      const body = await response.json() as Detail & { error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to open email.");
      setSelected(body); setMessages((rows) => rows.map((row) => row.id === message.id ? { ...row, isRead: true } : row));
    } catch (reason) { setError(errorText(reason)); }
  }

  async function update(action: "read" | "unread" | "star" | "unstar" | "trash" | "restore", message: Message) {
    try {
      const response = await fetch("/api/admin/mail", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, messageId: message.id, mailboxId }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to update email.");
      if (selected?.id === message.id && (action === "trash" || action === "restore")) setSelected(null);
      await loadMessages(true);
    } catch (reason) { setError(errorText(reason)); }
  }

  async function permanentlyDelete(message: Message) {
    if (!window.confirm("Delete this message permanently?")) return;
    try {
      const params = new URLSearchParams({ mailboxId, messageId: message.id, permanent: "true" });
      const response = await fetch(`/api/admin/mail?${params}`, { method: "DELETE" });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to delete email.");
      setSelected(null); await loadMessages(true);
    } catch (reason) { setError(errorText(reason)); }
  }

  function startCompose(next: Partial<ComposeState> = {}, mode: "send" | "draft" | "reply" = "send") {
    setCompose({ to: "", cc: "", bcc: "", subject: "", content: "", ...next }); setComposeMode(mode); setComposeError(""); setAttachments([]); setComposeOpen(true);
  }

  function replyTo(replyAll = false) {
    if (!selected) return;
    const cc = replyAll ? selected.ccAddress : "";
    const to = replyAll ? [selected.fromAddress, selected.ccAddress].filter(Boolean).join(", ") : selected.fromAddress;
    startCompose({ to, cc, subject: selected.subject.toLowerCase().startsWith("re:") ? selected.subject : `Re: ${selected.subject}`, content: `<p><br></p><blockquote>${selected.html}</blockquote>`, messageId: selected.id, inReplyTo: selected.messageHeader }, "reply");
  }

  function forwardMessage() {
    if (!selected) return;
    startCompose({ subject: selected.subject.toLowerCase().startsWith("fwd:") ? selected.subject : `Fwd: ${selected.subject}`, content: `<p><br></p><p>---------- Forwarded message ----------</p><p>From: ${selected.fromAddress}<br>To: ${selected.toAddress}<br>Subject: ${selected.subject}</p>${selected.html}` });
  }

  async function submitCompose(event?: FormEvent<HTMLFormElement>, actionOverride?: "send" | "draft" | "reply") {
    event?.preventDefault(); setComposeSending(true); setComposeError("");
    try {
      const data = new FormData(); const content = editorRef.current?.innerHTML ?? compose.content;
      const action = actionOverride ?? composeMode;
      Object.entries({ mailboxId, action, to: compose.to, cc: compose.cc, bcc: compose.bcc, subject: compose.subject, content, messageId: compose.messageId ?? "", inReplyTo: compose.inReplyTo ?? "", refHeader: compose.refHeader ?? "" }).forEach(([key, value]) => data.set(key, value));
      attachments.forEach((file) => data.append("attachments", file));
      const response = await fetch("/api/admin/mail", { method: "POST", body: data }); const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to send email.");
      setComposeOpen(false); await loadMessages(true);
    } catch (reason) { setComposeError(errorText(reason)); } finally { setComposeSending(false); }
  }

  function changeFolder(next: FolderKey) { setFolder(next); setPage(1); setSelected(null); setQuery(""); setSearchInput(""); }

  function changeMailbox(next: string) { setMailboxId(next); setFolder("inbox"); setPage(1); setSelected(null); setQuery(""); setSearchInput(""); setMessages([]); setFolderRows([]); }

  if (!configured) return <section className="max-w-3xl rounded-lg border border-[var(--line)] bg-white p-6 md:p-8"><div className="flex size-11 items-center justify-center rounded-full bg-[#e8f3ee] text-[var(--brand)]"><MailIcon /></div><h1 className="mt-5 text-3xl font-black">Mail is ready for connection</h1><p className="mt-3 leading-7 text-[var(--muted)]">Add the server-side Zoho mailbox configuration, then reload this page. No mailbox credentials are sent to the browser.</p><div className="mt-6 rounded-md bg-[#f3f7f5] p-4 font-mono text-xs leading-7 text-[#40544b]">ZOHO_MAILBOXES_JSON<br /><br />Legacy single mailbox is also supported:<br />ZOHO_MAIL_REGION<br />ZOHO_CLIENT_ID<br />ZOHO_CLIENT_SECRET<br />ZOHO_REFRESH_TOKEN<br />ZOHO_ACCOUNT_ID<br />ZOHO_MAIL_ADDRESS</div><p className="mt-5 text-sm text-[var(--muted)]">See <code>docs/zoho-mail.md</code> for the official Zoho setup steps.</p></section>;

  const currentMessage = selected;
  const currentFolder = folders.find((item) => item.key === folder)!;
   return <>
     <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">Workspace</p><h1 className="mt-2 text-4xl font-black">Mail</h1><p className="mt-2 text-[var(--muted)]">{activeMailbox?.displayName} · {activeMailbox?.email}</p></div><div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-sm font-bold text-[var(--muted)]">Mailbox<select value={mailboxId} onChange={(event) => changeMailbox(event.target.value)} className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold text-[var(--ink)]" aria-label="Select mailbox">{mailboxes.map((item) => <option key={item.id} value={item.id}>{item.displayName} · {item.email}</option>)}</select></label><button type="button" onClick={() => startCompose()} className="inline-flex items-center gap-2 rounded-md bg-[var(--brand)] px-4 py-2.5 text-sm font-black text-white hover:bg-[var(--brand-strong)]"><PenLine size={16} /> Compose</button></div></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-[var(--line)] bg-white p-3"><p className="px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">Mailbox</p>{folders.map((item) => { const Icon = item.icon; const count = item.key === "inbox" ? unreadCount : folderRows.find((row) => row.name.toLowerCase().includes(item.label.split(" ")[0].toLowerCase()))?.unreadCount; return <button key={item.key} type="button" onClick={() => changeFolder(item.key)} className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-bold ${folder === item.key ? "bg-[#e7f3ee] text-[var(--brand-strong)]" : "text-[#40544b] hover:bg-[#f3f7f5]"}`}><span className="flex items-center gap-3"><Icon size={17} />{item.label}</span>{count ? <span className="rounded-full bg-[#cde7dc] px-2 py-0.5 text-xs">{count}</span> : null}</button>; })}</aside>
       <section className="min-w-0 rounded-lg border border-[var(--line)] bg-white">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 md:flex-row md:items-center"><form onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(searchInput.trim()); }} className="flex min-w-0 flex-1 gap-2"><div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-[var(--line)] px-3"><Search size={17} className="shrink-0 text-[var(--muted)]" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search this mailbox" className="min-w-0 flex-1 border-0 py-2.5 text-sm outline-none" /></div><select value={field} onChange={(event) => { setField(event.target.value); setPage(1); }} className="hidden rounded-md border border-[var(--line)] px-2 text-sm sm:block"><option value="entire">All fields</option><option value="sender">Sender</option><option value="to">Recipient</option><option value="subject">Subject</option><option value="content">Body</option></select><button type="submit" className="rounded-md border border-[var(--line)] px-3 text-sm font-bold hover:bg-[#f3f7f5]">Search</button></form><button type="button" aria-label="Refresh mailbox" onClick={() => void loadMessages()} className="inline-flex size-10 items-center justify-center rounded-md border border-[var(--line)] text-[var(--muted)] hover:bg-[#f3f7f5]"><RefreshCw size={17} /></button></div>
        {error ? <div className="m-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div> : null}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3 text-sm"><p className="font-bold">{currentFolder.label}{query ? ` · ${query}` : ""}</p><div className="flex items-center gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded p-1.5 hover:bg-[#f3f7f5] disabled:opacity-40"><ChevronLeft size={17} /></button><span className="text-xs text-[var(--muted)]">Page {page}</span><button type="button" disabled={!hasMore || loading} onClick={() => setPage((value) => value + 1)} className="rounded p-1.5 hover:bg-[#f3f7f5] disabled:opacity-40"><ChevronRight size={17} /></button></div></div>
        {loading ? <div className="p-10 text-center text-sm text-[var(--muted)]">Loading mailbox…</div> : messages.length ? <div>{messages.map((message) => <article key={message.id} className={`flex items-start gap-3 border-b border-[var(--line)] px-4 py-4 transition hover:bg-[#f7faf8] ${message.isRead ? "" : "bg-[#f1f8f4]"}`}><button type="button" onClick={() => void update(message.isStarred ? "unstar" : "star", message)} aria-label={message.isStarred ? "Remove important flag" : "Mark important"} className={`mt-1 shrink-0 ${message.isStarred ? "text-[var(--accent)]" : "text-[#a5b4ad]"}`}><Star size={17} fill={message.isStarred ? "currentColor" : "none"} /></button><button type="button" onClick={() => void openMessage(message)} className="min-w-0 flex-1 text-left"><div className="flex items-start justify-between gap-3"><p className={`truncate text-sm ${message.isRead ? "font-semibold" : "font-black"}`}>{message.sender}</p><time className="shrink-0 text-xs text-[var(--muted)]">{formatDate(message.date)}</time></div><p className={`mt-1 truncate text-sm ${message.isRead ? "font-semibold" : "font-black"}`}>{message.subject}</p><p className="mt-1 truncate text-xs text-[var(--muted)]">{message.summary || "No preview available"}</p></button>{message.hasAttachment ? <FileText size={16} className="mt-1 shrink-0 text-[var(--muted)]" /> : null}</article>)}</div> : <div className="p-10 text-center"><MailOpen className="mx-auto text-[#9db4aa]" /><p className="mt-3 font-bold">No messages here</p><p className="mt-1 text-sm text-[var(--muted)]">Try another folder or search term.</p></div>}
      </section>
    </div>
     {currentMessage ? <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 md:items-center md:p-6"><section className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-t-lg bg-white shadow-2xl md:rounded-lg"><div className="flex items-start justify-between gap-4 border-b border-[var(--line)] p-5"><div className="min-w-0"><p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--accent)]">{currentMessage.fromAddress}</p><h2 className="mt-2 text-2xl font-black">{currentMessage.subject}</h2><p className="mt-2 text-sm text-[var(--muted)]">To: {currentMessage.toAddress || "Not provided"}{currentMessage.ccAddress ? ` · Cc: ${currentMessage.ccAddress}` : ""}</p></div><button type="button" aria-label="Close email" onClick={() => setSelected(null)} className="rounded-md p-2 hover:bg-[#f3f7f5]"><X size={19} /></button></div><div className="flex flex-wrap gap-2 border-b border-[var(--line)] p-3"><button type="button" onClick={() => replyTo()} className="rounded-md bg-[var(--brand)] px-3 py-2 text-xs font-bold text-white">Reply</button><button type="button" onClick={() => replyTo(true)} className="rounded-md border border-[var(--line)] px-3 py-2 text-xs font-bold">Reply all</button><button type="button" onClick={forwardMessage} className="rounded-md border border-[var(--line)] px-3 py-2 text-xs font-bold">Forward</button><button type="button" onClick={() => void update(currentMessage.isStarred ? "unstar" : "star", currentMessage)} className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] px-3 py-2 text-xs font-bold"><Star size={14} fill={currentMessage.isStarred ? "currentColor" : "none"} /> {currentMessage.isStarred ? "Unstar" : "Star"}</button><button type="button" onClick={() => void update("unread", currentMessage)} className="rounded-md border border-[var(--line)] px-3 py-2 text-xs font-bold">Mark unread</button><button type="button" onClick={() => void update(folder === "trash" ? "restore" : "trash", currentMessage)} className="ml-auto inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700">{folder === "trash" ? <Archive size={14} /> : <Trash2 size={14} />}{folder === "trash" ? "Restore" : "Trash"}</button>{folder === "trash" ? <button type="button" onClick={() => void permanentlyDelete(currentMessage)} className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700">Delete forever</button> : null}</div><div className="overflow-y-auto p-5">{currentMessage.html ? <div className="prose-content max-w-none text-sm" dangerouslySetInnerHTML={{ __html: currentMessage.html }} /> : <pre className="whitespace-pre-wrap text-sm leading-6">{currentMessage.text}</pre>}{currentMessage.attachments.length ? <div className="mt-8 border-t border-[var(--line)] pt-4"><p className="text-sm font-black">Attachments</p><div className="mt-3 flex flex-wrap gap-2">{currentMessage.attachments.map((attachment) => <a key={attachment.id} href={`/api/admin/mail/${encodeURIComponent(currentMessage.id)}/attachments/${attachment.id}?mailboxId=${encodeURIComponent(mailboxId)}`} className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-xs font-bold hover:bg-[#f3f7f5]"><Download size={14} />{attachment.name}</a>)}</div></div> : null}</div></section></div> : null}
    {composeOpen ? <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 p-0 md:items-center md:p-6"><form onSubmit={(event) => void submitCompose(event)} className="w-full max-w-3xl rounded-t-lg bg-white shadow-2xl md:rounded-lg"><div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--accent)]">{composeMode === "draft" ? "Draft" : composeMode === "reply" ? "Reply" : "New message"}</p><h2 className="mt-1 text-xl font-black">{composeMode === "reply" ? "Reply to message" : composeMode === "draft" ? "Continue draft" : "Compose"}</h2></div><button type="button" aria-label="Close composer" onClick={() => setComposeOpen(false)} className="rounded-md p-2 hover:bg-[#f3f7f5]"><X size={19} /></button></div><div className="grid gap-3 p-5"><input value={compose.to} onChange={(event) => setCompose((state) => ({ ...state, to: event.target.value }))} placeholder="To" required className="rounded-md border border-[var(--line)] px-3 py-2.5 text-sm" /><input value={compose.cc} onChange={(event) => setCompose((state) => ({ ...state, cc: event.target.value }))} placeholder="Cc" className="rounded-md border border-[var(--line)] px-3 py-2.5 text-sm" /><input value={compose.bcc} onChange={(event) => setCompose((state) => ({ ...state, bcc: event.target.value }))} placeholder="Bcc" className="rounded-md border border-[var(--line)] px-3 py-2.5 text-sm" /><input value={compose.subject} onChange={(event) => setCompose((state) => ({ ...state, subject: event.target.value }))} placeholder="Subject" className="rounded-md border border-[var(--line)] px-3 py-2.5 text-sm" /><div className="flex gap-1 border border-b-0 border-[var(--line)] px-2 pt-2"><button type="button" onClick={() => document.execCommand("bold")} className="rounded px-2 py-1 text-sm font-black hover:bg-[#f3f7f5]">B</button><button type="button" onClick={() => document.execCommand("italic")} className="rounded px-2 py-1 text-sm italic hover:bg-[#f3f7f5]">I</button><button type="button" onClick={() => document.execCommand("insertUnorderedList")} className="rounded px-2 py-1 text-sm hover:bg-[#f3f7f5]">• List</button></div><div ref={editorRef} contentEditable suppressContentEditableWarning onInput={(event) => setCompose((state) => ({ ...state, content: event.currentTarget.innerHTML }))} className="min-h-40 max-h-60 overflow-y-auto border border-[var(--line)] px-3 py-3 text-sm outline-none" aria-label="Email body" /><div className="flex flex-wrap items-center justify-between gap-3"><label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold"><FileText size={16} /> Attach files<input type="file" multiple onChange={(event) => setAttachments(Array.from(event.target.files ?? []))} className="sr-only" /></label>{attachments.length ? <p className="text-xs text-[var(--muted)]">{attachments.map((file) => file.name).join(", ")}</p> : null}</div>{composeError ? <p className="text-sm text-red-700">{composeError}</p> : null}<div className="flex justify-end gap-2 border-t border-[var(--line)] pt-4"><button type="button" onClick={() => void submitCompose(undefined, "draft")} disabled={composeSending} className="rounded-md border border-[var(--line)] px-4 py-2.5 text-sm font-bold">Save draft</button><button type="submit" disabled={composeSending} className="inline-flex items-center gap-2 rounded-md bg-[var(--brand)] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"><Send size={16} />{composeSending ? "Sending…" : "Send"}</button></div></div></form></div> : null}
  </>;
}
