import prisma from "@/lib/prisma";
import { embedQuery, toVectorLiteral } from "./embeddings";

export type RetrievedChunk = {
  id: string;
  content: string;
  page: number | null;
  documentId: string;
  filename: string;
  similarity: number;
};

/**
 * Cosine similarity below this is treated as "no relevant context".
 * Without a floor, an unrelated question still pulls back the least-bad
 * chunks and the model dutifully answers from them — which is the single
 * most common way RAG produces confident nonsense.
 */
const MIN_SIMILARITY = 0.55;
const DEFAULT_TOP_K = 5;

export async function retrieveContext(
  userId: string,
  query: string,
  options: { topK?: number; documentIds?: string[] } = {}
): Promise<RetrievedChunk[]> {
  const { topK = DEFAULT_TOP_K, documentIds } = options;

  const trimmed = query.trim();
  if (!trimmed) return [];

  // Skip the embedding call entirely if this user has nothing indexed.
  const readyCount = await prisma.document.count({
    where: { userId, status: "ready" },
  });
  if (readyCount === 0) return [];

  const vector = toVectorLiteral(await embedQuery(trimmed));

  // pgvector's <=> operator is cosine distance, so similarity = 1 - distance.
  const rows = documentIds?.length
    ? await prisma.$queryRaw<RetrievedChunk[]>`
        SELECT c.id, c.content, c.page, c."documentId",
               d.filename,
               1 - (c.embedding <=> ${vector}::vector) AS similarity
        FROM "DocumentChunk" c
        JOIN "Document" d ON d.id = c."documentId"
        WHERE c."userId" = ${userId}
          AND d.status = 'ready'
          AND c."documentId" = ANY(${documentIds}::text[])
        ORDER BY c.embedding <=> ${vector}::vector
        LIMIT ${topK}
      `
    : await prisma.$queryRaw<RetrievedChunk[]>`
        SELECT c.id, c.content, c.page, c."documentId",
               d.filename,
               1 - (c.embedding <=> ${vector}::vector) AS similarity
        FROM "DocumentChunk" c
        JOIN "Document" d ON d.id = c."documentId"
        WHERE c."userId" = ${userId}
          AND d.status = 'ready'
        ORDER BY c.embedding <=> ${vector}::vector
        LIMIT ${topK}
      `;

  return (rows as RetrievedChunk[]).filter(
    (r: RetrievedChunk) => Number(r.similarity) >= MIN_SIMILARITY
  );
}

/** Format retrieved chunks into a system-prompt context block. */
export function buildContextBlock(chunks: RetrievedChunk[]): string {
  return chunks
    .map((c, i) => {
      const location = c.page ? `${c.filename}, page ${c.page}` : c.filename;
      return `[${i + 1}] (${location})\n${c.content}`;
    })
    .join("\n\n---\n\n");
}

export const RAG_SYSTEM_PROMPT = `You are a helpful assistant answering from the user's uploaded documents.

Rules:
- Answer using ONLY the context below. Do not use outside knowledge to fill gaps.
- Cite the sources you used inline as [1], [2], matching the numbered context.
- If the context does not contain the answer, say so plainly and explain what
  the documents do cover. Do not guess.
- If the context only partially answers, say which part is unsupported.`;
