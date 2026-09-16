export type SourceRow = { title: string; url: string; publisher?: string; dateAccessed?: string };
export type FaqRow = { question: string; answer: string };

export const structuredFieldNames = {
  faqQuestion: "faqQuestion",
  faqAnswer: "faqAnswer",
  sourceTitle: "sourceTitle",
  sourceUrl: "sourceUrl",
  sourcePublisher: "sourcePublisher",
  sourceDateAccessed: "sourceDateAccessed",
  referenceTitle: "referenceTitle",
  referenceUrl: "referenceUrl",
  referencePublisher: "referencePublisher",
  referenceDateAccessed: "referenceDateAccessed",
} as const;

export function serializeSourceRows(rows: SourceRow[]) {
  return rows.map((row) => [row.title, row.url, row.publisher ?? "", row.dateAccessed ?? ""].join(" | ")).join("\n");
}

export function serializeFaqRows(rows: FaqRow[]) {
  return rows.map((row) => `${row.question} | ${row.answer}`).join("\n");
}

const stringValues = (formData: FormData, name: string) => formData.getAll(name).map((value) => value.toString());
const hasText = (values: string[]) => values.some((value) => value.trim().length > 0);
const valueAt = (values: string[], index: number) => values[index] ?? "";

function sourceRowsFromFormData(formData: FormData, prefix: "source" | "reference") {
  const title = stringValues(formData, structuredFieldNames[`${prefix}Title`]);
  const url = stringValues(formData, structuredFieldNames[`${prefix}Url`]);
  const publisher = stringValues(formData, structuredFieldNames[`${prefix}Publisher`]);
  const dateAccessed = stringValues(formData, structuredFieldNames[`${prefix}DateAccessed`]);
  const count = Math.max(title.length, url.length, publisher.length, dateAccessed.length);
  const rows = Array.from({ length: count }, (_, index) => ({
    title: valueAt(title, index),
    url: valueAt(url, index),
    publisher: valueAt(publisher, index),
    dateAccessed: valueAt(dateAccessed, index),
  }));
  return { rows, hasDirectValue: hasText([...title, ...url, ...publisher, ...dateAccessed]) };
}

function faqRowsFromFormData(formData: FormData) {
  const question = stringValues(formData, structuredFieldNames.faqQuestion);
  const answer = stringValues(formData, structuredFieldNames.faqAnswer);
  const count = Math.max(question.length, answer.length);
  const rows = Array.from({ length: count }, (_, index) => ({
    question: valueAt(question, index),
    answer: valueAt(answer, index),
  }));
  return { rows, hasDirectValue: hasText([...question, ...answer]) };
}

export function structuredRawValues(formData: FormData) {
  const sources = sourceRowsFromFormData(formData, "source");
  const references = sourceRowsFromFormData(formData, "reference");
  const faqs = faqRowsFromFormData(formData);

  return {
    sourcesRaw: sources.hasDirectValue ? serializeSourceRows(sources.rows) : formData.get("sourcesRaw")?.toString() ?? "",
    referencesRaw: references.hasDirectValue ? serializeSourceRows(references.rows) : formData.get("referencesRaw")?.toString() ?? "",
    faqsRaw: faqs.hasDirectValue ? serializeFaqRows(faqs.rows) : formData.get("faqsRaw")?.toString() ?? "",
  };
}
