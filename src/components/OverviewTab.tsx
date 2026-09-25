"use client";

import { ARCHITECTURE_LAYERS } from "@/lib/constants";
import { Server, Database, Brain, Sparkles, ArrowRight, Play, CheckCircle2, Terminal } from "lucide-react";

interface OverviewProps {
  overviewData: any;
  onNavigateTab: (tab: string) => void;
}

export function OverviewTab({ overviewData, onNavigateTab }: OverviewProps) {
  const counts = overviewData?.counts || {
    users: 2,
    projects: 2,
    datasets: 1,
    models: 2,
    documents: 1,
    agents: 3,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Single Unified Full-Stack Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            PyDataAI Platform Engine
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            A production-oriented system consolidating the entire modern Python AI/Data ecosystem:
            <strong> Django</strong> for administrative domain logic &amp; user management,
            <strong> FastAPI</strong> for low-latency ML/DL inference,
            <strong> PostgreSQL + pgvector</strong> for relational &amp; semantic storage,
            <strong> Scikit-learn + PyTorch</strong> for tabular and neural intelligence, and
            <strong> GenAI + Autonomous Agents</strong> for reasoning.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab("data")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Explore Data Pipeline
            </button>
            <button
              onClick={() => onNavigateTab("ml")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
            >
              Test ML Predictions <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab("rag")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
            >
              Query RAG Knowledge <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Active Users", val: counts.users, icon: Server, color: "text-blue-400" },
          { label: "Catalog Datasets", val: counts.datasets, icon: Database, color: "text-emerald-400" },
          { label: "Trained Models", val: counts.models, icon: Brain, color: "text-purple-400" },
          { label: "RAG Documents", val: counts.documents, icon: Sparkles, color: "text-amber-400" },
          { label: "Active Agents", val: counts.agents, icon: CheckCircle2, color: "text-cyan-400" },
          { label: "Projects", val: counts.projects, icon: Server, color: "text-indigo-400" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="mt-2 text-2xl font-bold text-white font-mono">{item.val}</div>
            </div>
          );
        })}
      </div>

      {/* System Topology / Architectural Flow Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Unified Service Topology &amp; Request Flow
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Decoupled responsibilities: Django orchestrates management &amp; auth; FastAPI runs ML inference, RAG, and Agents.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 self-start sm:self-auto">
            Modular Monolith Architecture
          </span>
        </div>

        {/* ASCII / Graphical Architecture Box */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed">
          <div className="min-w-[650px] space-y-4">
            <div className="text-center font-semibold text-indigo-400">
              [ WEB / API CLIENT (Next.js 16 Control Plane) ]
            </div>
            <div className="text-center text-slate-500">│</div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-emerald-300">
                <div className="font-bold">Django Management (Port 8000)</div>
                <div className="text-[11px] text-emerald-400/80 mt-1">Auth · User Profiles · Projects · Admin Console · Model Registry</div>
              </div>
              <div className="p-3 rounded-lg border border-cyan-500/40 bg-cyan-950/20 text-cyan-300">
                <div className="font-bold">FastAPI AI Engine (Port 8080)</div>
                <div className="text-[11px] text-cyan-400/80 mt-1">/predict · /train · /rag/query · /agents/run · High Concurrency</div>
              </div>
            </div>
            <div className="text-center text-slate-500">│</div>
            <div className="p-3 rounded-lg border border-indigo-500/40 bg-indigo-950/30 text-center text-indigo-300">
              <div className="font-bold">PostgreSQL 16 Core + pgvector</div>
              <div className="text-[11px] text-indigo-300/80 mt-1">
                Relational tables (users, datasets, models) + High-dimensional HNSW vector embeddings (document_chunks)
              </div>
            </div>
            <div className="text-center text-slate-500">│</div>
            <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                <div className="font-semibold">Data Layer</div>
                <div className="text-slate-400 text-[10px]">NumPy · Pandas · SciPy</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-purple-300">
                <div className="font-semibold">ML &amp; Deep Learning</div>
                <div className="text-slate-400 text-[10px]">Scikit-learn · PyTorch</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-blue-300">
                <div className="font-semibold">GenAI &amp; Agents</div>
                <div className="text-slate-400 text-[10px]">RAG · Vector Search · Tool Use</div>
              </div>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 text-center text-slate-400 text-[11px]">
              <strong>Deployment:</strong> Docker Compose (Django + FastAPI + Postgres + Redis + Celery Worker)
            </div>
          </div>
        </div>
      </div>

      {/* 9 Architectural Layers Matrix */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Complete Architectural Components Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ARCHITECTURE_LAYERS.map((layer, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-200">{layer.layer}</span>
                  <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{layer.description}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {layer.tech.map((t, tIdx) => (
                  <span
                    key={tIdx}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${layer.badgeColor}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow progression timeline */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3">10-Phase Platform Progression</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {[
            "1. Python Foundation",
            "2. NumPy & Pandas",
            "3. Django Core",
            "4. FastAPI Gateway",
            "5. Scikit-learn ML",
            "6. PyTorch DL",
            "7. LLM & Embeddings",
            "8. pgvector RAG",
            "9. AI Agents",
            "10. Docker Production",
          ].map((phase, pIdx) => (
            <div key={pIdx} className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {phase}
              </span>
              {pIdx < 9 && <span className="text-slate-600">→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
