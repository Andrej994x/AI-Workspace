import express, { Request, Response } from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";

import { addMessage, getHistory } from "../services/memoryStore";

dotenv.config();

const router = express.Router();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const userId = "default";
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const history = getHistory(userId);

    addMessage(userId, { role: "user", content: message });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        ...history,
        { role: "user", content: message }
      ],
    });

    const reply = completion.choices[0].message.content ?? "";

    addMessage(userId, { role: "assistant", content: reply });

    res.json({ reply });
  } catch (error: any) {
    console.error("❌ Error in /api/chat route:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
