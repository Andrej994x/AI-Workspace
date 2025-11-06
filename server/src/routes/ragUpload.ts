import { Router, Request, Response } from "express";
import multer from "multer";
import { splitIntoChunks } from "../services/chunk";
import { embedTexts } from "../services/embeddings";
import { addChunks } from "../services/memoryStore";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const pdfParse = require("pdf-parse-fixed");

type UploadedFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

router.post("/upload", upload.array("files", 10), async (req: Request, res: Response) => {
  try {
    const userId = (req.body.userId || "default").toString();
    const files = (req.files as unknown as UploadedFile[]) ?? [];

    if (!files.length) {
      return res.status(400).json({ error: "Нема прикачени фајлови." });
    }

    const allChunks: {
      text: string;
      source: string;
      mime: string;
      chunkIndex: number;
    }[] = [];

    for (const file of files) {
      const mime = file.mimetype;
      const source = file.originalname;
      let text = "";

      if (mime === "application/pdf") {
        const pdf = await pdfParse(file.buffer);
        text = pdf.text || "";
      } else if (mime === "text/plain") {
        text = file.buffer.toString("utf-8");
      } else {
        console.warn(`⚠️ Игнориран тип: ${source} (${mime})`);
        continue;
      }

      const cleaned = text
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/[ ]{2,}/g, " ");

      const chunks = splitIntoChunks(cleaned, 1000, 200);
      chunks.forEach((c, idx) =>
        allChunks.push({ text: c, source, mime, chunkIndex: idx })
      );
    }

    if (!allChunks.length) {
      return res.status(400).json({ error: "Нема содржина за индексирање." });
    }

    const embeddings = await embedTexts(allChunks.map((c) => c.text));

    const ragChunks = allChunks.map((c, i) => ({
      id: uuidv4(),
      text: c.text,
      metadata: {
        userId,
        source: c.source,
        chunkIndex: c.chunkIndex,
        mime: c.mime,
      },
      embedding: embeddings[i],
    }));

    addChunks(userId, ragChunks);

    res.json({
      success: true,
      userId,
      sources: [...new Set(allChunks.map((x) => x.source))],
      chunksIndexed: ragChunks.length,
    });
  } catch (err) {
    console.error("❌ /upload error:", err);
    res.status(500).json({ error: "Грешка при upload/индексирање." });
  }
});

export default router;
