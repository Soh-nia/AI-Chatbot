import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/** DELETE /api/documents/:id — remove a document and its chunks (cascade). */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Scope the delete by userId so one user can't delete another's document
  // by guessing an id.
  const result = await prisma.document.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (result.count === 0) {
    return Response.json({ error: "Document not found." }, { status: 404 });
  }

  return Response.json({ success: true });
}
