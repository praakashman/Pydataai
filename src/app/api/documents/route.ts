import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents, documentChunks, users, projects, auditLogs } from "@/db/schema";
import { chunkDocumentText } from "@/lib/rag-engine";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const docList = await db.select().from(documents).orderBy(desc(documents.createdAt));
    return NextResponse.json({ status: "success", documents: docList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, filename, content, fileType = "txt" } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and document content are required" }, { status: 400 });
    }

    const [firstUser] = await db.select().from(users).limit(1);
    const [firstProj] = await db.select().from(projects).limit(1);

    const chunks = chunkDocumentText(content, 140, 20);

    const [newDoc] = await db.insert(documents).values({
      projectId: firstProj?.id || null,
      userId: firstUser?.id || 1,
      title,
      filename: filename || `${title.toLowerCase().replace(/\s+/g, "_")}.${fileType}`,
      fileType,
      fileSize: `${(content.length / 1024).toFixed(1)} KB`,
      chunkCount: chunks.length,
      content,
    }).returning();

    // Insert chunks
    for (const ch of chunks) {
      await db.insert(documentChunks).values({
        documentId: newDoc.id,
        chunkIndex: ch.chunkIndex,
        chunkText: ch.chunkText,
        tokenCount: ch.tokenCount,
        embedding: [0.08, -0.15, 0.22, 0.04, -0.09], // simulated pgvector embedding
        metadata: { chunkIndex: ch.chunkIndex, title },
      });
    }

    await db.insert(auditLogs).values({
      service: "FastAPI RAG Pipeline",
      action: "DOCUMENT_EMBEDDING_INDEXED",
      userId: firstUser?.id || 1,
      statusCode: 201,
      latencyMs: 52,
      details: { documentId: newDoc.id, chunkCount: chunks.length, tokens: chunks.reduce((a, b) => a + b.tokenCount, 0) },
    });

    return NextResponse.json({
      status: "success",
      document: newDoc,
      chunkCount: chunks.length,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Document upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
