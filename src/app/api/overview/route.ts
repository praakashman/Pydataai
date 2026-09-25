import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, projects, datasets, mlModels, documents, aiAgents, auditLogs } from "@/db/schema";
import { seedInitialDataIfEmpty } from "@/lib/seed";
import { count } from "drizzle-orm";

export async function GET() {
  try {
    await seedInitialDataIfEmpty();

    const [userCount] = await db.select({ count: count() }).from(users);
    const [projectCount] = await db.select({ count: count() }).from(projects);
    const [datasetCount] = await db.select({ count: count() }).from(datasets);
    const [modelCount] = await db.select({ count: count() }).from(mlModels);
    const [docCount] = await db.select({ count: count() }).from(documents);
    const [agentCount] = await db.select({ count: count() }).from(aiAgents);

    const recentProjects = await db.select().from(projects).limit(5);
    const allUsers = await db.select().from(users).limit(10);
    const recentDatasets = await db.select().from(datasets).limit(6);
    const recentModels = await db.select().from(mlModels).limit(6);

    // Audit log
    await db.insert(auditLogs).values({
      service: "Django Admin",
      action: "FETCH_SYSTEM_OVERVIEW",
      statusCode: 200,
      latencyMs: 14,
      details: { caller: "Dashboard UI", role: "ADMIN" },
    });

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      architecture: {
        backend: "Django + FastAPI",
        database: "PostgreSQL 16 + pgvector",
        ml: "Scikit-learn + PyTorch",
        genAi: "LLM + RAG + Agents",
        deployment: "Docker Containerized",
      },
      counts: {
        users: userCount.count,
        projects: projectCount.count,
        datasets: datasetCount.count,
        models: modelCount.count,
        documents: docCount.count,
        agents: agentCount.count,
      },
      users: allUsers,
      projects: recentProjects,
      datasets: recentDatasets,
      models: recentModels,
    });
  } catch (error: any) {
    console.error("Error in overview route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
