import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ingestDocument, markDocumentFailed } from "@/lib/rag/ingest";
import {
  MAX_FILE_BYTES,
  SUPPORTED_MIME_TYPES,
  UnsupportedFileError,
} from "@/lib/rag/parse";

export const maxDuration = 60;

/** GET /api/documents — list the signed-in user's documents. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      size: true,
      status: true,
      error: true,
      chunkCount: true,
      createdAt: true,
    },
  });

  return Response.json({ documents });
}

/** POST /api/documents — upload a file, then parse, chunk, embed and store it. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let file: File | null = null;
  try {
    const formData = await req.formData();
    const value = formData.get("file");
    if (value instanceof File) file = value;
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  if (!file) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return Response.json(
      { error: `File is too large. Maximum size is ${MAX_FILE_BYTES / 1024 / 1024} MB.` },
      { status: 413 }
    );
  }

  const isSupported =
    (SUPPORTED_MIME_TYPES as readonly string[]).includes(file.type) ||
    /\.(pdf|docx|txt|md)$/i.test(file.name);

  if (!isSupported) {
    return Response.json(
      { error: "Unsupported file type. Upload a PDF, DOCX, TXT or Markdown file." },
      { status: 415 }
    );
  }

  const document = await prisma.document.create({
    data: {
      userId,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      status: "processing",
    },
  });

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { chunkCount } = await ingestDocument({
      documentId: document.id,
      userId,
      buffer,
      mimeType: file.type,
      filename: file.name,
    });

    return Response.json({
      document: { ...document, status: "ready", chunkCount },
    });
  } catch (error) {
    await markDocumentFailed(document.id, error);

    const message =
      error instanceof UnsupportedFileError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to process document.";

    console.error("[documents] ingestion failed:", error);
    return Response.json(
      { error: message, documentId: document.id },
      { status: 422 }
    );
  }
}
