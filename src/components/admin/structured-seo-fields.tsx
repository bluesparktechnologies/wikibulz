"use client";

import { useMemo, useState } from "react";
import { serializeFaqRows, serializeSourceRows, structuredFieldNames, type FaqRow, type SourceRow } from "@/lib/admin/structured-fields";

const blankSource = (): SourceRow => ({ title: "", url: "", publisher: "", dateAccessed: "" });
const blankFaq = (): FaqRow => ({ question: "", answer: "" });

function FieldButton({ children, onClick }: { children: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="w-fit rounded-md border border-[var(--line)] bg-white px-3 py-2 text-xs font-black">{children}</button>;
}

function withoutRow<T>(rows: T[], index: number, fallback: () => T) {
  const next = rows.filter((_, rowIndex) => rowIndex !== index);
  return next.length ? next : [fallback()];
}

export function StructuredSeoFields({ sources = [], references = [], faqs = [] }: { sources?: SourceRow[]; references?: SourceRow[]; faqs?: FaqRow[] }) {
  const [sourceRows, setSourceRows] = useState<SourceRow[]>(sources.length ? sources : [blankSource()]);
  const [referenceRows, setReferenceRows] = useState<SourceRow[]>(references.length ? references : [blankSource()]);
  const [faqRowsState, setFaqRowsState] = useState<FaqRow[]>(faqs.length ? faqs : [blankFaq()]);
  const sourcesRaw = useMemo(() => serializeSourceRows(sourceRows), [sourceRows]);
  const referencesRaw = useMemo(() => serializeSourceRows(referenceRows), [referenceRows]);
  const faqsRaw = useMemo(() => serializeFaqRows(faqRowsState), [faqRowsState]);

  const updateSource = (index: number, key: keyof SourceRow, value: string) => setSourceRows((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  const updateReference = (index: number, key: keyof SourceRow, value: string) => setReferenceRows((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  const updateFaq = (index: number, key: keyof FaqRow, value: string) => setFaqRowsState((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));

  return (
    <>
      <input type="hidden" name="sourcesRaw" value={sourcesRaw} />
      <input type="hidden" name="referencesRaw" value={referencesRaw} />
      <input type="hidden" name="faqsRaw" value={faqsRaw} />
      <section className="grid min-w-0 gap-5 rounded-lg border border-[var(--line)] bg-[#f7faf8] p-4">
        <h2 className="text-lg font-black">FAQ Schema</h2>
        <div className="grid gap-3">
          {faqRowsState.map((row, index) => (
            <div key={index} className="grid gap-3 rounded border border-[var(--line)] bg-white p-3 md:grid-cols-[1fr_1.4fr_auto]">
              <input name={structuredFieldNames.faqQuestion} value={row.question} onChange={(event) => updateFaq(index, "question", event.target.value)} placeholder="Question" className="rounded border border-[var(--line)] px-3 py-2" />
              <input name={structuredFieldNames.faqAnswer} value={row.answer} onChange={(event) => updateFaq(index, "answer", event.target.value)} placeholder="Answer" className="rounded border border-[var(--line)] px-3 py-2" />
              <FieldButton onClick={() => setFaqRowsState((rows) => withoutRow(rows, index, blankFaq))}>Remove</FieldButton>
            </div>
          ))}
        </div>
        <FieldButton onClick={() => setFaqRowsState((rows) => [...rows, blankFaq()])}>Add FAQ</FieldButton>
      </section>

      <section className="grid gap-5 rounded-lg border border-[var(--line)] bg-[#f7faf8] p-4">
        <h2 className="text-lg font-black">Sources And References</h2>
        <div className="grid gap-4">
          <p className="text-sm font-black text-[var(--accent)]">Sources</p>
          {sourceRows.map((row, index) => (
            <div key={index} className="grid min-w-0 gap-3 rounded border border-[var(--line)] bg-white p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,.8fr)_minmax(0,.7fr)_auto]">
              <input name={structuredFieldNames.sourceTitle} value={row.title} onChange={(event) => updateSource(index, "title", event.target.value)} placeholder="Title" className="w-full min-w-0 rounded border border-[var(--line)] px-3 py-2" />
              <input name={structuredFieldNames.sourceUrl} value={row.url} onChange={(event) => updateSource(index, "url", event.target.value)} placeholder="https://source.com" className="w-full min-w-0 rounded border border-[var(--line)] px-3 py-2" />
              <input name={structuredFieldNames.sourcePublisher} value={row.publisher ?? ""} onChange={(event) => updateSource(index, "publisher", event.target.value)} placeholder="Publisher" className="w-full min-w-0 rounded border border-[var(--line)] px-3 py-2" />
              <input name={structuredFieldNames.sourceDateAccessed} value={row.dateAccessed ?? ""} onChange={(event) => updateSource(index, "dateAccessed", event.target.value)} type="date" className="w-full min-w-0 rounded border border-[var(--line)] px-3 py-2" />
              <FieldButton onClick={() => setSourceRows((rows) => withoutRow(rows, index, blankSource))}>Remove</FieldButton>
            </div>
          ))}
          <FieldButton onClick={() => setSourceRows((rows) => [...rows, blankSource()])}>Add Source</FieldButton>
        </div>
        <div className="grid gap-4">
          <p className="text-sm font-black text-[var(--accent)]">References</p>
          {referenceRows.map((row, index) => (
            <div key={index} className="grid min-w-0 gap-3 rounded border border-[var(--line)] bg-white p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,.8fr)_minmax(0,.7fr)_auto]">
              <input name={structuredFieldNames.referenceTitle} value={row.title} onChange={(event) => updateReference(index, "title", event.target.value)} placeholder="Title" className="w-full min-w-0 rounded border border-[var(--line)] px-3 py-2" />
              <input name={structuredFieldNames.referenceUrl} value={row.url} onChange={(event) => updateReference(index, "url", event.target.value)} placeholder="https://reference.com" className="w-full min-w-0 rounded border border-[var(--line)] px-3 py-2" />
              <input name={structuredFieldNames.referencePublisher} value={row.publisher ?? ""} onChange={(event) => updateReference(index, "publisher", event.target.value)} placeholder="Publisher" className="w-full min-w-0 rounded border border-[var(--line)] px-3 py-2" />
              <input name={structuredFieldNames.referenceDateAccessed} value={row.dateAccessed ?? ""} onChange={(event) => updateReference(index, "dateAccessed", event.target.value)} type="date" className="w-full min-w-0 rounded border border-[var(--line)] px-3 py-2" />
              <FieldButton onClick={() => setReferenceRows((rows) => withoutRow(rows, index, blankSource))}>Remove</FieldButton>
            </div>
          ))}
          <FieldButton onClick={() => setReferenceRows((rows) => [...rows, blankSource()])}>Add Reference</FieldButton>
        </div>
      </section>
    </>
  );
}
