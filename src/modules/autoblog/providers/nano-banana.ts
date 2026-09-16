import { env } from "@/lib/validation/env";
import { okResult, postJson, providerError } from "@/modules/autoblog/providers/http";
import { healthResult, unavailableProvider } from "@/modules/autoblog/providers/unavailable";
import type { ImageProvider } from "@/modules/autoblog/types/providers";
import { getStorageAdapter } from "@/services/media";

async function generateImage(provider: string, prompt: string, alt: string) {
  if (!env.GEMINI_API_KEY || !env.GEMINI_IMAGE_MODEL) return unavailableProvider<{ url: string; alt: string }>(provider, "GEMINI_API_KEY and GEMINI_IMAGE_MODEL are required for image generation.");
  const started = Date.now();
  try {
    const response = await postJson<{ candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }> }>(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_IMAGE_MODEL)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
      { contents: [{ role: "user", parts: [{ text: prompt }] }] },
      {},
      60000,
    );
    const inline = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData;
    if (!inline?.data) throw new Error("Gemini image response did not include image data.");
    const extension = inline.mimeType?.includes("png") ? "png" : inline.mimeType?.includes("jpeg") ? "jpg" : "webp";
    const key = `generated/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const stored = await getStorageAdapter().putBuffer(Buffer.from(inline.data, "base64"), key, inline.mimeType ?? "image/webp");
    return okResult(provider, { url: stored.url, alt }, started, 0.04);
  } catch (error) {
    return providerError<{ url: string; alt: string }>(provider, error);
  }
}

export const nanoBananaImageProvider: ImageProvider = {
  name: "Nano Banana Image",
  async health() {
    if (!env.GEMINI_API_KEY || !env.GEMINI_IMAGE_MODEL) return healthResult(this.name, "CONFIGURATION_REQUIRED", "Gemini API key and image model are required.");
    return healthResult(this.name, "HEALTHY", "Gemini image provider is configured.");
  },
  generateFeaturedImage(input) {
    return generateImage(this.name, `Create one useful editorial featured image for "${input.title}". Brief: ${input.brief}. Style: ${input.style ?? "clean realistic editorial"}. No fake logos, no misleading claims.`, input.title);
  },
  generateSupportingVisual(input) {
    return generateImage(this.name, `Create one useful supporting visual for this article section: ${input.section}. Brief: ${input.brief}.`, input.section);
  },
  generateDiagram(input) {
    return generateImage(this.name, `Create a clear educational diagram explaining: ${input.concept}. Brief: ${input.brief}.`, input.concept);
  },
  regenerateImage(input) {
    return generateImage(this.name, `Regenerate image ${input.imageId} with these instructions: ${input.instructions}.`, input.instructions);
  },
};
