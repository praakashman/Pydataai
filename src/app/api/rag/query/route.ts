import { NextResponse } from "next/server";
import { db } from "@/db";
import { documentChunks, documents, conversations, messages, auditLogs, users } from "@/db/schema";
import { retrieveRelevantChunks, synthesizeRagAnswer } from "@/lib/rag-engine";
import { eq, desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, documentId, conversationId } = body;

    if (!query) {
      return NextResponse.json({ error: "Query message is required" }, { status: 400 });
    }

    // Retrieve chunks
    let chunksQuery = db.select({
      id: documentChunks.id,
      chunkIndex: documentChunks.chunkIndex,
      chunkText: documentChunks.chunkText,
    }).from(documentChunks);

    if (documentId) {
      chunksQuery = db.select({
        id: documentChunks.id,
        chunkIndex: documentChunks.chunkIndex,
        chunkText: documentChunks.chunkText,
      }).from(documentChunks).where(eq(documentChunks.documentId, Number(documentId))) as any;
    }

    const allChunks = await chunksQuery;
    const topRanked = retrieveRelevantChunks(query, allChunks, 3);
    const result = synthesizeRagAnswer(query, topRanked);

    // Save to conversation if provided, or create one
    let targetConvId = conversationId;
    if (!targetConvId) {
      const [firstUser] = await db.select().from(users).limit(1);
      const [newConv] = await db.insert(conversations).values({
        userId: firstUser?.id || 1,
        title: query.slice(0, 35) + (query.length > 35 ? "..." : ""),
        mode: "rag",
        activeDocumentId: documentId ? Number(documentId) : null,
      }).returning();
      targetConvId = newConv.id;
    }

    // Insert user message
    await db.insert(messages).values({
      conversationId: targetConvId,
      sender: "user",
      content: query,
    });

    // Insert assistant response
    const [botMsg] = await db.insert(messages).values({
      conversationId: targetConvId,
      sender: "assistant",
      content: result.answer,
      retrievedChunks: result.retrievedChunks,
    }).returning();

    await db.insert(auditLogs).values({
      service: "FastAPI RAG API",
      action: "VECTOR_SEARCH_SYNTHESIZE",
      statusCode: 200,
      latencyMs: 78,
      details: {
        query,
        matchedChunks: topRanked.length,
        topScore: topRanked[0]?.score || 0,
      },
    });

    return NextResponse.json({
      status: "success",
      conversationId: targetConvId,
      answer: result.answer,
      retrievedChunks: result.retrievedChunks,
    });
  } catch (err: any) {
    console.error("RAG query error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
