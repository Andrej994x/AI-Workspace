export type RAGChunk = {
  id: string;
  text: string;
  metadata: {
    userId: string;
    source: string;     // filename
    chunkIndex: number;
    mime: string;       // "application/pdf" | "text/plain"
  };
  embedding: number[];  // OpenAI embedding vector
};
