import { z } from "zod";
import { runGeminiText, type GeminiRequest } from "@/modules/autoblog/ai/gemini-client";

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) return raw.slice(start, end + 1);
  return raw;
}

export async function runStructuredTask<T>(request: GeminiRequest, schema: z.ZodType<T>) {
  const text = await runGeminiText({ ...request, prompt: `${request.prompt}\n\nReturn only valid JSON matching the requested schema.` });
  const parsed = JSON.parse(extractJson(text));
  const direct = schema.safeParse(parsed);
  if (direct.success) return direct.data;
  if (parsed && typeof parsed === "object") {
    for (const key of ["draft", "article", "post", "result", "output"]) {
      const nested = (parsed as Record<string, unknown>)[key];
      const nestedResult = schema.safeParse(nested);
      if (nestedResult.success) return nestedResult.data;
    }
  }
  return schema.parse(parsed);
}

export async function runTextTask(request: GeminiRequest) {
  return runGeminiText(request);
}
