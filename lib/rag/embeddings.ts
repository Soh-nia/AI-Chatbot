/**
 * `gemini-embedding-001` natively outputs 3072-dimensional vectors, but
 * supports truncating to a smaller size via `outputDimensionality` (Matryoshka
 * representation learning). We request 768 to match the vector(768) column in
 * the Prisma schema — changing this means a migration.
 *
 * The `@langchain/google-genai` wrapper doesn't expose `outputDimensionality`,
 * so we call the REST API directly instead.
 */
export const EMBEDDING_DIMENSIONS = 768;
const EMBEDDING_MODEL = "gemini-embedding-001";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.warn(
    "[rag] GOOGLE_GENERATIVE_AI_API_KEY is not set — embedding calls will fail."
  );
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
          outputDimensionality: EMBEDDING_DIMENSIONS,
        })),
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding request failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { embeddings: { values: number[] }[] };
  return data.embeddings.map((e) => e.values);
}

/** Embed many chunks at once (used during ingestion). */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  return embedBatch(texts);
}

/** Embed a single search query (used at retrieval time). */
export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embedBatch([text]);
  return vector;
}

/**
 * pgvector accepts a vector as the string literal '[0.1,0.2,...]'.
 * Always pass this through a parameterized query, never interpolate it.
 */
export function toVectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
