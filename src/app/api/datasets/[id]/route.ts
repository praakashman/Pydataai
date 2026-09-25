import { NextResponse } from "next/server";
import { db } from "@/db";
import { datasets, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cleanData, profileDataset } from "@/lib/data-engine";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const datasetId = parseInt(id, 10);
    if (isNaN(datasetId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [dataset] = await db.select().from(datasets).where(eq(datasets.id, datasetId)).limit(1);
    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "success", dataset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Handles cleaning, transforming or updating dataset
  try {
    const { id } = await params;
    const datasetId = parseInt(id, 10);
    const body = await req.json();
    const { action, handleNulls = "fill_mean", dropDuplicates = true } = body;

    const [dataset] = await db.select().from(datasets).where(eq(datasets.id, datasetId)).limit(1);
    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    const rawRows = (dataset.dataJson as any[]) || [];

    if (action === "clean") {
      const cleanedRows = cleanData(rawRows, { handleNulls, dropDuplicates });
      const headers = Object.keys(cleanedRows[0] || {});
      const profiling = profileDataset(cleanedRows, headers);

      const [updated] = await db
        .update(datasets)
        .set({
          cleanedDataJson: cleanedRows,
          summaryStats: profiling.stats,
          columnsMeta: profiling.columns,
          updatedAt: new Date(),
        })
        .where(eq(datasets.id, datasetId))
        .returning();

      await db.insert(auditLogs).values({
        service: "FastAPI Data Engine",
        action: "DATA_CLEANING_PIPELINE",
        userId: dataset.userId,
        statusCode: 200,
        latencyMs: 42,
        details: { datasetId, cleanedRowsCount: cleanedRows.length, handleNulls, dropDuplicates },
      });

      return NextResponse.json({
        status: "success",
        dataset: updated,
        profiling,
      });
    }

    return NextResponse.json({ error: "Invalid action. Supported: 'clean'" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const datasetId = parseInt(id, 10);
    await db.delete(datasets).where(eq(datasets.id, datasetId));
    return NextResponse.json({ status: "success", message: "Dataset deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
