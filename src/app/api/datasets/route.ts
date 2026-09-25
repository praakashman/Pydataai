import { NextResponse } from "next/server";
import { db } from "@/db";
import { datasets, projects, users, auditLogs } from "@/db/schema";
import { parseCsv, profileDataset } from "@/lib/data-engine";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(datasets).orderBy(desc(datasets.createdAt));
    return NextResponse.json({ status: "success", datasets: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, filename, csvText, projectId } = body;

    if (!name || !csvText) {
      return NextResponse.json({ error: "Dataset name and CSV text are required" }, { status: 400 });
    }

    const { headers, rows } = parseCsv(csvText);
    if (rows.length === 0 || headers.length === 0) {
      return NextResponse.json({ error: "Could not parse valid CSV content" }, { status: 400 });
    }

    const profiling = profileDataset(rows, headers);

    // Get default user & project if not provided
    const [firstUser] = await db.select().from(users).limit(1);
    const [firstProj] = await db.select().from(projects).limit(1);

    const [newDataset] = await db.insert(datasets).values({
      projectId: projectId || firstProj?.id || null,
      userId: firstUser?.id || 1,
      name,
      filename: filename || `${name.toLowerCase().replace(/\s+/g, "_")}.csv`,
      fileSize: `${(csvText.length / 1024).toFixed(1)} KB`,
      rowCount: rows.length,
      colCount: headers.length,
      dataJson: rows,
      columnsMeta: profiling.columns,
      summaryStats: profiling.stats,
    }).returning();

    await db.insert(auditLogs).values({
      service: "FastAPI Data API",
      action: "UPLOAD_DATASET",
      userId: firstUser?.id || 1,
      statusCode: 201,
      latencyMs: 38,
      details: { datasetId: newDataset.id, rows: rows.length, columns: headers.length },
    });

    return NextResponse.json({
      status: "success",
      dataset: newDataset,
      profiling,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating dataset:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
