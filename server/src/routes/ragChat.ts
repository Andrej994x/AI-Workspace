import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { embedTexts } from "../services/embeddings";
import { querySimilarChunks } from "../services/memoryStore";

dotenv.config();


const router = Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

router.post("/rag-chat", async (req: Request, res: Response) => {
  try {
    const { userId = "default", message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Missing message." });
    }

    const [queryEmbedding] = await embedTexts([message]);

    const relevant = await querySimilarChunks(userId, queryEmbedding, 5);

    const context = relevant.map((r: any) => r.text).join("\n\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ти си интелигентен асистент кој одговара користејќи ги документите дадени во контекстот. Ако нешто не е во контекстот, кажи дека немаш информација.",
        },
        {
          role: "user",
          content: `Контекст:\n${context}\n\nПрашање: ${message}`,
        },
      ],
    });

    const answer = completion.choices[0].message.content ?? "Нема одговор.";

    res.json({
      reply: answer,
      sources: relevant.map((r: any) => r.metadata.source),
    });
  } catch (err: any) {
    console.error("❌ RAG chat error:", err.message);
    res.status(500).json({ error: "Internal RAG chat error." });
  }
});

export default router;
