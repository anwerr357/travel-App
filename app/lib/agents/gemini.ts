import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseMarkdownToJson } from "~/lib/utils";
import { geminiRateLimiter, retryWithBackoff } from "~/lib/rate-limiter";

const MODEL = "gemini-2.5-flash";

export async function runAgent<T>(name: string, prompt: string): Promise<T> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  await geminiRateLimiter.checkAndWait(name);

  const result = await retryWithBackoff(() =>
    genAi.getGenerativeModel({ model: MODEL }).generateContent([prompt])
  );

  const parsed = parseMarkdownToJson(result.response.text());

  if (!parsed) {
    throw new Error(`${name} returned a response that could not be parsed as JSON`);
  }

  return parsed as T;
}

export function jsonInstruction(shape: string) {
  return `Return ONLY a valid JSON object wrapped in a markdown code block, matching this shape exactly:

\`\`\`json
${shape}
\`\`\``;
}
