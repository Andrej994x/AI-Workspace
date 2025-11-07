// server/src/routes/summarize.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import { summarizeLongText, SummaryMode } from "../services/summarizer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();


const pdfParse = require("pdf-parse-fixed");

type UploadedFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

function isPdf(mime: string) {
  return mime === "application/pdf";
}

function isTxt(mime: string) {
  return mime === "text/plain";
}

router.post(
  "/summarize",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const mode = (req.body.mode as SummaryMode) || "short";
      let rawText = (req.body.text as string) || "";

      const file = req.file as UploadedFile | undefined;
      if (!rawText && file?.buffer) {
        if (isPdf(file.mimetype)) {
          const pdf = await pdfParse(file.buffer);
          rawText = (pdf?.text as string) || "";
        } else if (isTxt(file.mimetype)) {
          rawText = file.buffer.toString("utf-8");
        } else {
          return res
            .status(400)
            .json({ ok: false, error: "Only PDF or TXT are supported." });
        }
      }

      if (!rawText || rawText.trim().length < 5) {
        return res
          .status(400)
          .json({ ok: false, error: "No input text provided." });
      }

      const summary = await summarizeLongText(rawText, mode);

      return res.json({
        ok: true,
        summary,
        stats: {
          inputChars: rawText.length,
          mode,
          from: file ? file.originalname : "text",
        },
      });
    } catch (err: any) {
      console.error("❌ /summarize error:", err);
      return res
        .status(500)
        .json({ ok: false, error: err?.message ?? "Server error" });
    }
  }
);

export default router;
