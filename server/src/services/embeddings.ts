import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const resp = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts
  });
  return resp.data.map((d) => d.embedding as number[]);
}

export async function embedOne(text: string): Promise<number[]> {
  const [vec] = await embedTexts([text]);
  return vec;
}

export function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i], bi = b[i];
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}
