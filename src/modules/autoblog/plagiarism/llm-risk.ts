import { z } from "zod";
import { runPromptStructuredTask } from "@/modules/autoblog/ai/gemini-text.service";
import type { Post } from "@/types/content";

const riskSchema = z.object({
  risk: z.enum(["LOW", "MEDIUM", "HIGH"]),
  reasons: z.array(z.string()).default([]),
  suspiciousPhrases: z.array(z.string()).default([]),
  manualCheckRecommended: z.boolean().default(true),
});

export type LlmPlagiarismRisk = z.infer<typeof riskSchema>;

export function deterministicOriginalityRisk(post: Pick<Post, "title" | "content" | "excerpt">): LlmPlagiarismRisk {
  const text = `${post.title} ${post.excerpt} ${post.content}`.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const sentences = text.split(/[.!?]/).map((item) => item.trim()).filter((item) => item.length > 30);
  const repeated = sentences.filter((sentence, index) => sentences.findIndex((candidate) => candidate.toLowerCase() === sentence.toLowerCase()) !== index);
  const genericPhrases = ["in today's fast-paced world", "it is important to note", "in conclusion", "unlock the power", "game changer"];
  const suspiciousPhrases = [
    ...repeated.slice(0, 5),
    ...genericPhrases.filter((phrase) => text.toLowerCase().includes(phrase)),
  ];
  return {
    risk: suspiciousPhrases.length >= 4 ? "HIGH" : suspiciousPhrases.length >= 2 ? "MEDIUM" : "LOW",
    reasons: suspiciousPhrases.length ? ["Repeated or generic phrasing found."] : ["No obvious repeated/generic originality risk found."],
    suspiciousPhrases,
    manualCheckRecommended: true,
  };
}

export async function runLlmOriginalityRisk(post: Pick<Post, "title" | "content" | "excerpt">, automationRunId?: string) {
  try {
    return await runPromptStructuredTask({
      taskType: "PlagiarismRewriteEditor",
      automationRunId,
      variables: {
        input: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          instruction: "Estimate originality risk only. Do not claim live web plagiarism detection. Flag copied-looking structure, repeated phrasing, generic AI phrasing, unsupported claims, and sections that should be manually checked.",
        },
      },
    }, riskSchema);
  } catch {
    return deterministicOriginalityRisk(post);
  }
}
