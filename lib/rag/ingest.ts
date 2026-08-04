import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { parseDocument } from "./parse";
import { embedDocuments, toVectorLiteral } from "./embeddings";

/**
 * ~1000 characters with 200 of overlap. The overlap matters: without it a
 * sentence split across a chunk boundary becomes unretrievable, because
 * neither half carries enough context to match the query.
 */
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

/** Embedding APIs rate-limit; send chunks in batches rather than all at once. */
const EMBED_BATCH_SIZE = 50;

export async function ingestDocument(params: {
  documentId: string;
  userId: string;
  buffer: Buffer;
  mimeType: string;
  filename: string;
}): Promise<{ chunkCount: number }> {
  const { documentId, userId, buffer, mimeType, filename } = params;

  const pages = await parseDocument(buffer, mimeType, filename);
  if (pages.length === 0) {
    throw new Error(
      "No readable text found. If this is a scanned PDF it needs OCR first."
    );
  }

  // Split each page separately so every chunk keeps its page number.
  const chunks: { content: string; page: number | null; index: number }[] = [];
  let index = 0;
  for (const page of pages) {
    const docs = await splitter.createDocuments([page.text]);
    for (const doc of docs) {
      const content = doc.pageContent.trim();
      if (content.length < 20) continue; // skip fragments too small to be useful
      chunks.push({ content, page: page.page, index: index++ });
    }
  }

  if (chunks.length === 0) {
    throw new Error("Document produced no usable text chunks.");
  }

  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
    const vectors = await embedDocuments(batch.map((c) => c.content));

    // The embedding column is an Unsupported() type in Prisma, so it can only
    // be written through raw SQL. Values stay parameterized.
    await prisma.$transaction(
      batch.map((chunk, j) =>
        prisma.$executeRaw`
          INSERT INTO "DocumentChunk"
            (id, "documentId", "userId", content, page, "chunkIndex", embedding)
          VALUES (
            ${randomUUID()},
            ${documentId},
            ${userId},
            ${chunk.content},
            ${chunk.page},
            ${chunk.index},
            ${toVectorLiteral(vectors[j])}::vector
          )
        `
      )
    );
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "ready", chunkCount: chunks.length, error: null },
  });

  return { chunkCount: chunks.length };
}

export async function markDocumentFailed(documentId: string, error: unknown) {
  const message =
    error instanceof Error ? error.message : "Failed to process document.";
  await prisma.document
    .update({
      where: { id: documentId },
      data: { status: "failed", error: message.slice(0, 500) },
    })
    .catch(() => {
      /* document may already be deleted — nothing to report */
    });
}
