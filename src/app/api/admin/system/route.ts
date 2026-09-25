import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(50);
    const userList = await db.select().from(users);

    const serviceStats = [
      { name: "Django Admin & Core", status: "Healthy", uptime: "99.98%", port: "8000" },
      { name: "FastAPI AI/ML Gateway", status: "Healthy", uptime: "99.95%", port: "8080" },
      { name: "PostgreSQL 16 + pgvector", status: "Connected", connections: "14/100", port: "5432" },
      { name: "Redis Queue & Cache", status: "Active", pendingTasks: 0, port: "6379" },
      { name: "Celery Worker Process", status: "Idle", workers: 4, concurrency: 8 },
    ];

    return NextResponse.json({
      status: "success",
      services: serviceStats,
      auditLogs: logs,
      users: userList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
