import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export type ParsedPage = {
  /** 1-based page number. Null for formats with no pagination. */
  page: number | null;
  text: string;
};

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain",
  "text/markdown",
] as const;

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export class UnsupportedFileError extends Error {}

/**
 * Extract text from an uploaded file, preserving page boundaries where the
 * format has them. Page numbers flow through to chunks so citations can say
 * "page 4" rather than just naming the file.
 */
export async function parseDocument(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<ParsedPage[]> {
  const lower = filename.toLowerCase();

  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.pages
        .map((p) => ({ page: p.num, text: (p.text ?? "").trim() }))
        .filter((p) => p.text.length > 0);
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    const { value } = await mammoth.extractRawText({ buffer });
    const text = value.trim();
    return text ? [{ page: null, text }] : [];
  }

  if (
    mimeType.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md")
  ) {
    const text = buffer.toString("utf-8").trim();
    return text ? [{ page: null, text }] : [];
  }

  throw new UnsupportedFileError(
    `Unsupported file type: ${mimeType || filename}. Upload a PDF, DOCX, TXT or Markdown file.`
  );
}
