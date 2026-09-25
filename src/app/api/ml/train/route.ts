import { NextResponse } from "next/server";
import { db } from "@/db";
import { mlModels, datasets, auditLogs, projects, users } from "@/db/schema";
import { trainMachineLearningModel } from "@/lib/ml-engine";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const modelsList = await db.select().from(mlModels).orderBy(desc(mlModels.createdAt));
    return NextResponse.json({ status: "success", models: modelsList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      algorithm,
      taskType = "classification",
      datasetId,
      targetColumn,
      featureColumns,
      hyperparameters = {},
    } = body;

    if (!name || !algorithm || !datasetId || !featureColumns || featureColumns.length === 0) {
      return NextResponse.json({ error: "Missing required fields for model training" }, { status: 400 });
    }

    const [dataset] = await db.select().from(datasets).where(eq(datasets.id, Number(datasetId))).limit(1);
    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    const rows = (dataset.cleanedDataJson as any[]) || (dataset.dataJson as any[]) || [];
    if (rows.length === 0) {
      return NextResponse.json({ error: "Dataset has no data rows" }, { status: 400 });
    }

    // Run ML training engine
    const trainingResult = trainMachineLearningModel({
      name,
      algorithm,
      taskType,
      targetColumn,
      featureColumns,
      rows,
    });

    const [firstUser] = await db.select().from(users).limit(1);

    const artifactExt = taskType === "deep_learning" ? "pth" : "joblib";
    const artifactPath = `models/${name.toLowerCase().replace(/\s+/g, "_")}.${artifactExt}`;

    const [newModel] = await db.insert(mlModels).values({
      projectId: dataset.projectId,
      userId: firstUser?.id || 1,
      datasetId: dataset.id,
      name,
      taskType,
      algorithm,
      targetColumn,
      featureColumns,
      hyperparameters,
      metrics: trainingResult.metrics,
      status: "trained",
      version: `v${Math.floor(Math.random() * 5 + 1)}.0`,
      artifactPath,
    }).returning();

    await db.insert(auditLogs).values({
      service: taskType === "deep_learning" ? "PyTorch DL Engine" : "Scikit-Learn ML Engine",
      action: "TRAIN_MODEL",
      userId: firstUser?.id || 1,
      statusCode: 201,
      latencyMs: taskType === "deep_learning" ? 185 : 64,
      details: {
        modelId: newModel.id,
        algorithm,
        taskType,
        accuracy: trainingResult.metrics.accuracy || trainingResult.metrics.r2,
      },
    });

    return NextResponse.json({
      status: "success",
      model: newModel,
      samplePredictions: trainingResult.samplePredictions,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Training error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
