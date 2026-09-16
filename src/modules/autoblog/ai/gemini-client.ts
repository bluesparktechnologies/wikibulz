import { env } from "@/lib/validation/env";

export type GeminiRequest = {
  system?: string;
  prompt: string;
  model?: string;
  temperature?: number;
  timeoutMs?: number;
};

export class GeminiConfigurationError extends Error {}

export async function runGeminiText({ system, prompt, model = env.GEMINI_TEXT_MODEL ?? "gemini-3.6-flash", temperature = 0.4, timeoutMs = 30000 }: GeminiRequest) {
  if (!env.GEMINI_API_KEY) throw new GeminiConfigurationError("GEMINI_API_KEY is required.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature },
      }),
    });
    if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
    const payload = await response.json();
    return String(payload.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("") ?? "");
  } finally {
    clearTimeout(timeout);
  }
}
