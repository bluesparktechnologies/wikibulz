import { z } from "zod";
import { env } from "@/lib/validation/env";
import { connectMongo } from "@/lib/db/mongoose";
import { AIUsageRecordModel, PromptTemplateModel } from "@/modules/autoblog/models/schemas";
import { runGeminiText } from "@/modules/autoblog/ai/gemini-client";
import { runStructuredTask } from "@/modules/autoblog/ai/structured-output";

type AiTaskInput = {
  taskType: string;
  variables: Record<string, unknown>;
  automationRunId?: string;
  postId?: string;
  timeoutMs?: number;
};

function renderTemplate(template: string, variables: Record<string, unknown>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => {
    const value = key.split(".").reduce<unknown>((current, part) => current && typeof current === "object" ? (current as Record<string, unknown>)[part] : undefined, variables);
    return typeof value === "string" ? value : JSON.stringify(value ?? "");
  });
}

async function getPrompt(taskType: string) {
  const db = await connectMongo();
  if (!db) return null;
  return PromptTemplateModel.findOne({ taskType, active: true }).sort({ version: -1 }).lean<{
    name: string;
    systemPrompt: string;
    userTemplate: string;
    model?: string;
    temperature?: number;
  }>();
}

async function recordUsage(input: AiTaskInput, status: "success" | "failed", startedAt: number, error?: string, costUsd = 0) {
  const db = await connectMongo();
  if (!db) return;
  await AIUsageRecordModel.create({
    provider: "Gemini",
    operation: input.taskType,
    automationRunId: input.automationRunId,
    postId: input.postId,
    latencyMs: Date.now() - startedAt,
    status,
    error,
    costUsd,
  });
}

export async function runPromptTextTask(input: AiTaskInput) {
  const startedAt = Date.now();
  try {
    const prompt = await getPrompt(input.taskType);
    const system = prompt?.systemPrompt ?? `${input.taskType}: follow the site's editorial, SEO, safety, and citation policies.`;
    const user = prompt ? renderTemplate(prompt.userTemplate, input.variables) : JSON.stringify(input.variables, null, 2);
    const text = await runGeminiText({
      system,
      prompt: user,
      model: prompt?.model ?? env.GEMINI_TEXT_MODEL ?? "gemini-3.6-flash",
      temperature: prompt?.temperature ?? 0.4,
      timeoutMs: input.timeoutMs,
    });
    await recordUsage(input, "success", startedAt);
    return text;
  } catch (error) {
    await recordUsage(input, "failed", startedAt, error instanceof Error ? error.message : "Gemini task failed.");
    throw error;
  }
}

export async function runPromptStructuredTask<T>(input: AiTaskInput, schema: z.ZodType<T>) {
  const startedAt = Date.now();
  try {
    const prompt = await getPrompt(input.taskType);
    const system = prompt?.systemPrompt ?? `${input.taskType}: return accurate, source-aware structured output.`;
    const user = prompt ? renderTemplate(prompt.userTemplate, input.variables) : JSON.stringify(input.variables, null, 2);
    const data = await runStructuredTask({
      system,
      prompt: user,
      model: prompt?.model ?? env.GEMINI_TEXT_MODEL ?? "gemini-3.6-flash",
      temperature: prompt?.temperature ?? 0.2,
      timeoutMs: input.timeoutMs,
    }, schema);
    await recordUsage(input, "success", startedAt);
    return data;
  } catch (error) {
    await recordUsage(input, "failed", startedAt, error instanceof Error ? error.message : "Gemini structured task failed.");
    throw error;
  }
}
