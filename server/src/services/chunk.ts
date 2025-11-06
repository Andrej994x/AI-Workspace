export function splitIntoChunks(
  text: string,
  chunkSize = 1000,
  overlap = 200
): string[] {
  const chunks: string[] = [];
  let i = 0;
  const len = text.length;
  while (i < len) {
    const slice = text.slice(i, Math.min(i + chunkSize, len)).trim();
    if (slice) chunks.push(slice);
    i += Math.max(1, chunkSize - overlap);
  }
  return chunks;
}
