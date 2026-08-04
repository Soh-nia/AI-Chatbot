"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export type DocumentSummary = {
  id: string;
  filename: string;
  size: number;
  status: "processing" | "ready" | "failed";
  error?: string | null;
  chunkCount: number;
  createdAt: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentPanel({
  onDocumentsChange,
}: {
  onDocumentsChange?: (docs: DocumentSummary[]) => void;
}) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to load documents");
      const data = await res.json();
      setDocuments(data.documents);
      onDocumentsChange?.(data.documents);
    } catch {
      // Non-fatal: the panel just stays empty.
    } finally {
      setIsLoading(false);
    }
  }, [onDocumentsChange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Upload failed.");
        return;
      }

      toast.success(
        `${file.name} indexed — ${data.document.chunkCount} chunks ready.`
      );
      await refresh();
    } catch {
      toast.error("Upload failed. Check your connection and try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (id: string, filename: string) => {
    // Optimistic: put it back if the request fails.
    const previous = documents;
    setDocuments((docs) => docs.filter((d) => d.id !== id));

    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setDocuments(previous);
      toast.error(`Could not delete ${filename}.`);
      return;
    }
    toast.success(`${filename} removed.`);
    onDocumentsChange?.(previous.filter((d) => d.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
          isDragging
            ? "border-sky-500 bg-sky-500/10"
            : "border-slate-300 dark:border-slate-700"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
            <p className="text-sm text-muted-foreground">
              Parsing, chunking and embedding…
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drop a file here, or
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Choose a file
            </Button>
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, TXT or Markdown · up to 10 MB
            </p>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading documents…</p>
      ) : documents.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No documents yet. Upload one and the assistant will answer from it.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {doc.status === "failed" ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              ) : doc.status === "processing" ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-sky-500" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate" title={doc.filename}>
                  {doc.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {doc.status === "failed"
                    ? (doc.error ?? "Failed to process")
                    : doc.status === "processing"
                      ? "Processing…"
                      : `${formatSize(doc.size)} · ${doc.chunkCount} chunks`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => remove(doc.id, doc.filename)}
                aria-label={`Delete ${doc.filename}`}
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
