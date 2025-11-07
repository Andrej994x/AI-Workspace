// server/src/services/summarizer.ts
import OpenAI from "openai";
import { splitIntoChunks } from "./chunk";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const MODEL = process.env.MODEL_NAME || "gpt-4o-mini";

export type SummaryMode = "short" | "detailed" | "bullets";

function systemPrompt(mode: SummaryMode) {
  const styles: Record<SummaryMode, string> = {
    short:
      "Summarize the content in 4–7 concise sentences. Keep it compact but clear.",
    detailed:
      "Write a detailed, well-structured summary (6–12 bullet points + 1–2 short paragraphs). Use headings if helpful.",
    bullets:
      "Summarize as bullet points only. 8–15 short, information-dense bullets.",
  };

  return `You are a helpful assistant that summarizes documents for busy professionals.
Output language: same as input.
Style: ${styles[mode]}`;
}


export async function summarizeLongText(
  rawText: string,
  mode: SummaryMode = "short"
): Promise<string> {
    
  const text = rawText.trim();
  if (!text) return "";


  const parts = splitIntoChunks(text, 1000, 200);

  const partials: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i];
    const res = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt(mode) },
        {
          role: "user",
          content: `This is part ${i + 1}/${parts.length} of a larger document. Summarize only this part:\n\n${chunk}`,
        },
      ],
    });

    partials.push(res.choices[0].message.content ?? "");
  }

  const merged = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You will receive several partial summaries. Merge them into a single coherent summary without repetition.",
      },
      { role: "user", content: partials.join("\n\n---\n\n") },
      { role: "system", content: systemPrompt(mode) },
    ],
  });

  return merged.choices[0].message.content ?? "";
}
