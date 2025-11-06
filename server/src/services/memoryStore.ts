
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Chunk {
  id: string;
  text: string;
  metadata: Record<string, any>;
  embedding: number[];
}

const chatMemory = new Map<string, ChatMessage[]>();   //  Chat memory
const docMemory = new Map<string, Chunk[]>();          //  RAG memory

// CHAT MEMORY
export function addMessage(userId: string, msg: ChatMessage) {
  const history = chatMemory.get(userId) || [];
  history.push(msg);
  chatMemory.set(userId, history);
}

export function getHistory(userId: string): ChatMessage[] {
  return chatMemory.get(userId) || [];
}

export function clearChat(userId: string) {
  chatMemory.delete(userId);
}

//  DOCUMENT MEMORY (RAG)
export function addChunks(userId: string, chunks: Chunk[]): void {
  const existing = docMemory.get(userId) || [];
  docMemory.set(userId, [...existing, ...chunks]);
}

export function getChunks(userId: string): Chunk[] {
  return docMemory.get(userId) || [];
}

export function clearChunks(userId: string): void {
  docMemory.delete(userId);
}


function cosineSim(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}

//  similarity search 
export function querySimilarChunks(
  userId: string,
  queryEmbedding: number[],
  topK: number = 5
) {
  const chunks = docMemory.get(userId) || [];

  const scored = chunks
    .map((chunk) => ({
      ...chunk,
      score: cosineSim(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}
