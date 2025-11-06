import { Router, Request, Response } from "express";
import { clearChat } from "../services/memoryStore";

const router = Router();

router.post("/clear", async (req: Request, res: Response) => {
  const userId = (req.body.userId || "default").toString();
  clearChat(userId);

  res.json({ success: true, userId });
});

export default router;
