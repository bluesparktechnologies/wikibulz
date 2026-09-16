"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Check, ChevronDown, Code2, Columns3, Heading2, Heading3, Heading4, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Pilcrow, Quote, Redo2, RemoveFormatting, Rows3, Strikethrough, Table2, Trash2, Undo2, Unlink2, Upload } from "lucide-react";

type RichEditorProps = { name: string; initialHtml: string; media?: Array<{ id: string; url: string; alt: string }>; onHtmlChange?: (html: string) => void };
type ToolButtonProps = { active?: boolean; children: ReactNode; disabled?: boolean; label: string; onClick: () => void };

function ToolButton({ active, children, disabled, label, onClick }: ToolButtonProps) {
  return <button type="button" disabled={disabled} aria-label={label} title={label} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-35 ${active ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm" : "border-[var(--line)] bg-white text-[#273a33] hover:border-[var(--brand)] hover:bg-[#edf5f1] hover:text-[var(--brand-strong)]"}`}>{children}</button>;
}

const blockOptions = [
  { label: "Paragraph", value: "paragraph", icon: Pilcrow },
  { label: "Heading 2", value: "h2", icon: Heading2 },
  { label: "Heading 3", value: "h3", icon: Heading3 },
  { label: "Heading 4", value: "h4", icon: Heading4 },
] as const;

export function RichEditor({ name, initialHtml, media = [], onHtmlChange }: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState(initialHtml);
  const [linkUrl, setLinkUrl] = useState("");
  const [bubbleLinkUrl, setBubbleLinkUrl] = useState("");
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const [bubbleLinkOpen, setBubbleLinkOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  let editor: ReturnType<typeof useEditor> | null = null;
  editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: false }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ allowBase64: false, HTMLAttributes: { loading: "lazy" } }),
      Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
      Placeholder.configure({ placeholder: "Write structured article content. Use H2/H3 sections; the title is the H1." }),
    ],
    content: initialHtml,
    onCreate: ({ editor: activeEditor }) => {
      // Always give an empty editor a paragraph block so typing can start immediately.
      if (activeEditor.isEmpty) activeEditor.commands.setParagraph();
    },
    onUpdate: ({ editor: activeEditor }) => { const nextHtml = activeEditor.getHTML(); setHtml(nextHtml); onHtmlChange?.(nextHtml); },
    editorProps: {
      attributes: { class: "prose-content min-h-[520px] rounded-xl border border-[var(--line)] bg-white px-4 py-4 text-base leading-8 shadow-sm outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[#d7eee7]" },
      handleKeyDown: (view, event) => {
        if (event.key !== "Enter" || view.state.selection.$from.parent.type.name !== "heading") return false;
        const { $from } = view.state.selection;
        if ($from.parentOffset !== $from.parent.content.size) return false;
        return editor?.chain().focus().splitBlock().setParagraph().run() ?? false;
      },
    },
  });

  const currentBlock = editor?.isActive("heading", { level: 2 }) ? blockOptions[1] : editor?.isActive("heading", { level: 3 }) ? blockOptions[2] : editor?.isActive("heading", { level: 4 }) ? blockOptions[3] : blockOptions[0];
  const CurrentBlockIcon = currentBlock.icon;
  const shouldShowBubbleMenu = useCallback(({ state }: { state: { selection: { empty: boolean } } }) => !state.selection.empty || bubbleLinkOpen, [bubbleLinkOpen]);

  function setBlock(value: (typeof blockOptions)[number]["value"]) {
    if (!editor) return;
    const commands = editor.chain().focus();
    if (value === "paragraph") commands.setParagraph().run();
    if (value === "h2") commands.setHeading({ level: 2 }).run();
    if (value === "h3") commands.setHeading({ level: 3 }).run();
    if (value === "h4") commands.setHeading({ level: 4 }).run();
    setBlockMenuOpen(false);
  }

  function applyLink(href = linkUrl) {
    if (!editor) return;
    const normalizedHref = href.trim();
    if (normalizedHref) editor.chain().focus().extendMarkRange("link").setLink({ href: normalizedHref }).run();
    else editor.chain().focus().unsetLink().run();
    setLinkUrl(""); setBubbleLinkUrl(""); setBubbleLinkOpen(false);
  }

  function insertImage(url = imageUrl, alt = imageAlt) {
    const src = url.trim();
    if (!editor || !src) return;
    editor.chain().focus().setImage({ src, alt: alt.trim() || "Article image" }).run();
    setImageUrl(""); setImageAlt("");
  }

  async function uploadContentImage(file?: File) {
    if (!file) return;
    setUploading(true); setMessage("");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("alt", imageAlt || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    const response = await fetch("/api/admin/media", { method: "POST", body: formData });
    const payload = await response.json().catch(() => null);
    setUploading(false);
    if (!response.ok || !payload?.url) { setMessage(payload?.error ?? "Image upload failed."); return; }
    insertImage(payload.url, payload.alt); setMessage("Image inserted.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const closeMenuUnlessTargeted = (event: React.SyntheticEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!target.closest('[aria-label="Change block type"], [role="menu"]')) setBlockMenuOpen(false);
  };

  return <div className="grid min-w-0 max-w-full gap-3" onPointerDownCapture={closeMenuUnlessTargeted} onClickCapture={closeMenuUnlessTargeted}>
    <div className="min-w-0 max-w-full overflow-visible rounded-xl border border-[var(--line)] bg-[#eef5f1] p-2 shadow-sm sm:p-3">
      <div className="flex min-w-0 max-w-full items-start gap-1.5">
        <div className="relative shrink-0">
            <button type="button" aria-label="Change block type" aria-haspopup="menu" aria-expanded={blockMenuOpen} onClick={() => setBlockMenuOpen((open) => !open)} onBlur={() => window.setTimeout(() => { if (!document.activeElement?.closest('[role="menu"]')) setBlockMenuOpen(false); }, 0)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-2.5 text-sm font-bold text-[#273a33] transition hover:border-[var(--brand)] hover:bg-[#edf5f1]"><CurrentBlockIcon size={16} /><span>{currentBlock.label}</span><ChevronDown size={15} /></button>
            {blockMenuOpen ? <div role="menu" className="absolute left-0 top-11 z-30 min-w-44 rounded-xl border border-[var(--line)] bg-white p-1.5 shadow-xl">{blockOptions.map((option) => { const Icon = option.icon; const selected = currentBlock.value === option.value; return <button key={option.value} type="button" role="menuitem" onMouseDown={(event) => event.preventDefault()} onClick={() => setBlock(option.value)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold transition ${selected ? "bg-[#d7eee7] text-[var(--brand-strong)]" : "text-[#273a33] hover:bg-[#edf5f1]"}`}><Icon size={16} />{option.label}{selected ? <Check className="ml-auto" size={15} /> : null}</button>; })}</div> : null}
        </div>
        <div className="min-w-0 flex-1 pb-1">
          <div className="flex min-w-0 w-full flex-wrap items-center gap-1.5">
          <ToolButton label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold size={17} /></ToolButton>
          <ToolButton label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic size={17} /></ToolButton>
          <ToolButton label="Strikethrough" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough size={17} /></ToolButton>
          <ToolButton label="Inline code" active={editor?.isActive("code")} onClick={() => editor?.chain().focus().toggleCode().run()}><Code2 size={17} /></ToolButton>
          <span className="mx-1 h-5 w-px bg-[var(--line)]" />
          <ToolButton label="Add link" active={editor?.isActive("link")} onClick={() => { setBubbleLinkOpen(true); editor?.commands.focus(); }}><Link2 size={17} /></ToolButton>
          <ToolButton label="Bullet list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List size={17} /></ToolButton>
          <ToolButton label="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered size={17} /></ToolButton>
          <ToolButton label="Quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote size={17} /></ToolButton>
          <ToolButton label="Divider" onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus size={17} /></ToolButton>
          <ToolButton label="Clear formatting" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting size={17} /></ToolButton>
          <span className="mx-1 h-5 w-px bg-[var(--line)]" />
          <ToolButton label="Undo" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}><Undo2 size={17} /></ToolButton>
          <ToolButton label="Redo" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}><Redo2 size={17} /></ToolButton>
        </div>
      </div>
      </div>

      <details className="mt-2 rounded-lg border border-[var(--line)] bg-white/75">
        <summary className="cursor-pointer px-3 py-2 text-sm font-bold text-[#273a33] marker:text-[var(--brand)]">Links, images and tables</summary>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 border-t border-[var(--line)] p-3">
          <div className="grid min-w-0 gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]"><input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="Paste a URL, select text, then apply" className="h-10 min-w-0 w-full rounded-lg border border-[var(--line)] bg-white px-3 text-sm" /><button type="button" onClick={() => applyLink()} className="h-10 rounded-lg bg-[var(--brand)] px-3 text-sm font-bold text-white">Apply link</button><button type="button" onClick={() => editor?.chain().focus().unsetLink().run()} className="h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm font-bold text-[#273a33]">Remove link</button></div>
          <div className="grid min-w-0 gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]"><input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Content image URL" className="h-10 min-w-0 w-full rounded-lg border border-[var(--line)] bg-white px-3 text-sm" /><input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="Image alt text" className="h-10 min-w-0 w-full rounded-lg border border-[var(--line)] bg-white px-3 text-sm" /><button type="button" onClick={() => insertImage()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 text-sm font-bold text-[#273a33]"><ImagePlus size={16} />Insert image</button><label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 text-sm font-bold text-[#273a33]"><Upload size={16} />{uploading ? "Uploading…" : "Upload image"}<input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(event) => uploadContentImage(event.target.files?.[0])} /></label></div>
          {media.length ? <select aria-label="Insert media library image" onChange={(event) => { const item = media.find((asset) => asset.url === event.target.value); if (item) insertImage(item.url, item.alt); event.currentTarget.value = ""; }} className="h-10 min-w-0 w-full rounded-lg border border-[var(--line)] bg-white px-3 text-sm font-bold"><option value="">Insert from media library</option>{media.map((asset) => <option key={asset.id} value={asset.url}>{asset.alt || asset.url}</option>)}</select> : null}
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 text-sm font-bold text-[#273a33]"><Table2 size={16} />Insert table</button><ToolButton label="Add table column" disabled={!editor?.isActive("table")} onClick={() => editor?.chain().focus().addColumnAfter().run()}><Columns3 size={17} /></ToolButton><ToolButton label="Add table row" disabled={!editor?.isActive("table")} onClick={() => editor?.chain().focus().addRowAfter().run()}><Rows3 size={17} /></ToolButton><ToolButton label="Delete table column" disabled={!editor?.isActive("table")} onClick={() => editor?.chain().focus().deleteColumn().run()}><Columns3 size={17} /></ToolButton><ToolButton label="Delete table row" disabled={!editor?.isActive("table")} onClick={() => editor?.chain().focus().deleteRow().run()}><Rows3 size={17} /></ToolButton><ToolButton label="Delete table" disabled={!editor?.isActive("table")} onClick={() => editor?.chain().focus().deleteTable().run()}><Trash2 size={17} /></ToolButton></div>
          {message ? <p className="text-sm font-bold text-[var(--accent)]" role="status">{message}</p> : null}
        </div>
      </details>
    </div>

    {editor ? <BubbleMenu editor={editor} shouldShow={shouldShowBubbleMenu} className="max-w-[calc(100vw-2rem)] rounded-xl border border-[#c9dfd7] bg-[#0c2b26] p-1.5 shadow-2xl"><div className="flex max-w-full items-center gap-1 overflow-x-auto [scrollbar-width:none]"><ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></ToolButton><ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolButton><ToolButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></ToolButton><ToolButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></ToolButton><ToolButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></ToolButton><ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></ToolButton><ToolButton label="Add link" active={editor.isActive("link")} onClick={() => setBubbleLinkOpen(true)}><Link2 size={16} /></ToolButton>{editor.isActive("link") ? <ToolButton label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}><Unlink2 size={16} /></ToolButton> : null}</div>{bubbleLinkOpen ? <div className="mt-1 flex gap-1 border-t border-white/20 pt-1"><input autoFocus value={bubbleLinkUrl} onChange={(event) => setBubbleLinkUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyLink(bubbleLinkUrl); } }} placeholder="https://" aria-label="Link URL" className="min-w-0 flex-1 rounded-md border-0 bg-white px-2 py-1.5 text-sm text-[#273a33] outline-none" /><button type="button" onClick={() => applyLink(bubbleLinkUrl)} className="rounded-md bg-[#a6d6c7] px-2 text-xs font-black text-[#0c2b26]">Add</button></div> : null}</BubbleMenu> : null}

    <EditorContent
      editor={editor}
      onFocus={() => setBlockMenuOpen(false)}
      onMouseDown={() => {
        if (!editor) return;
        if (editor.isEmpty && !editor.isActive("heading")) editor.commands.setParagraph();
        editor.commands.focus();
      }}
      onClick={() => {
        setBlockMenuOpen(false);
        if (!editor) return;
        const chain = editor.chain().focus();
        if (editor.isEmpty && !editor.isActive("heading")) chain.setParagraph();
        chain.run();
      }}
    />
    <textarea name={name} value={html} readOnly hidden />
  </div>;
}
