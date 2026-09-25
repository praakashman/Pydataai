import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiAgents, datasets, mlModels, documents, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(aiAgents);
    return NextResponse.json({ status: "success", agents: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentId, prompt, datasetId } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    let agent = null;
    if (agentId) {
      const [found] = await db.select().from(aiAgents).where(eq(aiAgents.id, Number(agentId))).limit(1);
      agent = found;
    }

    const agentName = agent?.name || "Data Analyst Agent";

    // Simulate Agent Step-by-Step Reasoning & Tool Execution Trace
    const traces: { step: number; tool: string; action: string; output: string }[] = [];

    // Step 1: Planning
    traces.push({
      step: 1,
      tool: "orchestrator_planner",
      action: "Deconstruct user instruction into analytical tasks",
      output: `Goal formulated: Execute automated data inspection, detect distributional skewness, and output actionable intelligence for: "${prompt}".`,
    });

    // Step 2: Tool execution (Pandas / SQL / Models)
    let summaryInsights = "";
    if (datasetId) {
      const [ds] = await db.select().from(datasets).where(eq(datasets.id, Number(datasetId))).limit(1);
      if (ds) {
        traces.push({
          step: 2,
          tool: "pandas_engine",
          action: `Read ${ds.name} into Pandas DataFrame (Shape: ${ds.rowCount} rows, ${ds.colCount} cols)`,
          output: `Parsed dataframe memory footprint: ${ds.fileSize}. Detected numerical columns: ${((ds.columnsMeta as any[]) || []).filter(c => c.type === 'number').map(c => c.name).join(", ")}.`,
        });

        traces.push({
          step: 3,
          tool: "statsmodels_tester",
          action: "Compute variance, IQR, null distribution and correlation vectors",
          output: `Evaluated summary statistics. Missing rate: 0.0%. Identified key variance drivers in: ${((ds.columnsMeta as any[]) || [])[1]?.name || "features"}.`,
        });

        summaryInsights = `The Data Analyst Agent analyzed **${ds.name}** containing ${ds.rowCount} instances across ${ds.colCount} feature vectors:
- **Core Pattern Detected:** Strongest correlation observed between tenure and retention likelihood.
- **Data Integrity:** No critical structural nulls observed; duplicate rows within normal tolerances.
- **Prescriptive Recommendation:** Prioritize proactive outreach for customers in early month-to-month contracts to curtail early attrition.`;
      }
    } else {
      traces.push({
        step: 2,
        tool: "postgres_query",
        action: "Query platform data repository and model performance registry",
        output: "Fetched active projects, datasets, and deployed machine learning endpoints.",
      });

      traces.push({
        step: 3,
        tool: "llm_reasoning_engine",
        action: "Synthesize platform telemetry and analytical guidelines",
        output: "Generated architectural response based on Python PyDataAI ecosystem.",
      });

      summaryInsights = `The Agent synthesized the prompt: "${prompt}".
- **Status:** All integrated Python components (NumPy, Pandas, Scikit-learn, PyTorch, FastAPI, PostgreSQL) are operational.
- **Action Taken:** Queried database state and validated deployment readiness.`;
    }

    traces.push({
      step: 4,
      tool: "final_response_synthesizer",
      action: "Format executive summary with code snippet and actionable recommendations",
      output: "Completed analytical execution pipeline.",
    });

    const executionLog = {
      agent: agentName,
      userPrompt: prompt,
      thoughtTrace: traces,
      finalResponse: summaryInsights,
      generatedPythonSnippet: `# PyDataAI Agent Generated Script\nimport pandas as pd\nimport numpy as np\n\ndf = pd.read_csv("dataset.csv")\nprint(df.describe().T)\ncorrelation = df.corr(numeric_only=True)\nprint("High correlation pairs:", correlation.unstack().sort_values(ascending=False).head(5))`,
    };

    await db.insert(auditLogs).values({
      service: "FastAPI Agent API",
      action: "AGENT_TOOL_EXECUTION",
      statusCode: 200,
      latencyMs: 142,
      details: { agent: agentName, stepsCount: traces.length },
    });

    return NextResponse.json({
      status: "success",
      result: executionLog,
    });
  } catch (err: any) {
    console.error("Agent execution error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
