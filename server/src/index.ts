import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRouter from "./routes/chat";
import ragUpload from "./routes/ragUpload";
import ragChat from "./routes/ragChat";
import chatClear from "./routes/chatClear";
import summarizeRouter from "./routes/summarize";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);


app.use(express.json({ limit: "10mb" }));

app.get("/", (_, res) => res.send("✅ API is running"));

app.use("/api", chatRouter);
app.use("/api", ragUpload);
app.use("/api", ragChat);
app.use("/api", chatClear);
app.use("/api", summarizeRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
