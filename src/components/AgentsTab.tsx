"use client";

import { useState } from "react";
import { Bot, Play, Terminal, CheckCircle2, Cpu, Wrench, Sparkles, ArrowRight } from "lucide-react";

interface AgentsTabProps {
  datasets: any[];
}

export function AgentsTab({ datasets }: AgentsTabProps) {
  const [activeAgentId, setActiveAgentId] = useState<number>(1);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number>(datasets[0]?.id || 1);
  const [prompt, setPrompt] = useState("Analyze this CSV and identify the most important trends and retention drivers.");
  const [isRunning, setIsRunning] = useState(false);
  const [agentOutput, setAgentOutput] = useState<any>(null);

  const agents = [
    {
      id: 1,
      name: "Data Analyst Agent",
      role: "Automated EDA & Statistical Insights",
      tools: ["pandas_engine", "statsmodels_tester", "outlier_detector", "correlation_analyzer"],
      description: "Inspects CSV files, detects missing values and outliers, calculates statistical distributions, generates correlation matrices, and summarizes key trends.",
    },
    {
      id: 2,
      name: "AutoML & Predictive Agent",
      role: "Model Architecture & Pipeline Selection",
      tools: ["scikit_train", "pytorch_trainer", "metric_evaluator", "model_registry"],
      description: "Evaluates classification and regression problems, selects optimal Scikit-learn/PyTorch algorithms, performs feature importance analysis, and exports deployment artifacts.",
    },
    {
      id: 3,
      name: "Document Intelligence RAG Agent",
      role: "Vector Search & Retrieval Specialist",
      tools: ["pgvector_retriever", "chunk_synthesizer", "semantic_ranker"],
      description: "Extracts text from PDFs, manages pgvector embeddings, performs semantic similarity matching, and provides cited answers to complex queries.",
    },
  ];

  const currentAgent = agents.find((a) => a.id === activeAgentId) || agents[0];

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setAgentOutput(null);

    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: currentAgent.id,
          prompt,
          datasetId: selectedDatasetId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAgentOutput(data.result);
      } else {
        alert(data.error || "Agent execution failed");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Autonomous AI Agents with Tool Calling
            </h2>
            <p className="text-xs text-slate-400">
              User Goal → Agent Reasoning → Dynamic Tool Selection (Pandas, Scikit, PostgreSQL) → Execution → Response.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300">
            FastAPI POST /api/v1/agents/run
          </span>
        </div>
      </div>

      {/* Agent Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((ag) => (
          <div
            key={ag.id}
            onClick={() => setActiveAgentId(ag.id)}
            className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              activeAgentId === ag.id
                ? "bg-slate-900 border-teal-500 shadow-lg shadow-teal-500/10"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{ag.name}</span>
                {activeAgentId === ag.id && (
                  <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                )}
              </div>
              <p className="text-[11px] text-teal-400 font-mono mt-1">{ag.role}</p>
              <p className="text-xs text-slate-400 mt-2">{ag.description}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
              {ag.tools.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Execution Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Prompt & Configuration (1 col) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wrench className="w-4 h-4 text-teal-400" /> Dispatch Agent Goal
          </h3>

          <form onSubmit={handleRunAgent} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Select Target Dataset</label>
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(Number(e.target.value))}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.rowCount} rows)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Agent Natural Language Goal</label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Instruct the agent what to inspect, calculate, or predict..."
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={isRunning}
              className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isRunning ? "Agent Executing Tools..." : "Run Autonomous Agent Loop"}
            </button>
          </form>

          {/* Tool Capabilities Spec */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              Sandboxed Agent Tools
            </span>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>✓ pandas_engine (read, dropna, stats)</li>
              <li>✓ postgres_query (read-only views)</li>
              <li>✓ scikit_eval (fit, evaluate, predict)</li>
              <li>✓ pgvector_retriever (semantic search)</li>
            </ul>
          </div>
        </div>

        {/* Right: Thought Trace & Reasoning Output (2 cols) */}
        <div className="lg:col-span-2 space-y-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-sm text-white">Agent Reasoning &amp; Tool Trace</span>
            </div>
            {agentOutput && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                Execution Complete (4 Steps)
              </span>
            )}
          </div>

          {agentOutput ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Step by Step Execution Logs */}
              <div className="space-y-2.5">
                {agentOutput.thoughtTrace.map((step: any) => (
                  <div
                    key={step.step}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-400">
                        Step {step.step}: {step.action}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Tool: {step.tool}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{step.output}</p>
                  </div>
                ))}
              </div>

              {/* Final Synthesis */}
              <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/30 text-xs font-mono space-y-2">
                <span className="font-bold text-teal-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Agent Synthesis &amp; Findings:
                </span>
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {agentOutput.finalResponse}
                </p>
              </div>

              {/* Generated Python Script */}
              {agentOutput.generatedPythonSnippet && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                    Autonomous Code Emission
                  </span>
                  <pre className="text-slate-300 text-[11px] overflow-x-auto">
                    {agentOutput.generatedPythonSnippet}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 font-mono text-xs space-y-2">
              <Bot className="w-8 h-8 mx-auto text-slate-600 animate-bounce" />
              <p>Ready to dispatch agent. Click &quot;Run Autonomous Agent Loop&quot; to inspect real-time tool calling.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
