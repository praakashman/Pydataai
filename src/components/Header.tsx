"use client";

import { Activity, Database, Cpu, Bot, FileText, BarChart3, Layers, Terminal } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  metrics?: {
    datasets: number;
    models: number;
    documents: number;
    agents: number;
  };
}

export function Header({ activeTab, setActiveTab, metrics }: HeaderProps) {
  const tabs = [
    { id: "overview", label: "Architecture", icon: Layers },
    { id: "data", label: "Data & Pandas", icon: BarChart3 },
    { id: "ml", label: "Scikit-learn & ML", icon: Cpu },
    { id: "pytorch", label: "PyTorch Deep Learning", icon: Activity },
    { id: "rag", label: "RAG & pgvector", icon: FileText },
    { id: "agents", label: "AI Agents", icon: Bot },
    { id: "admin", label: "Django Admin & APIs", icon: Database },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-lg tracking-wider">
              Py
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-lg tracking-tight">PyDataAI</span>
                <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                  v1.0 Stack
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Python Data + Django + FastAPI + ML + PyTorch + RAG + Agents
              </p>
            </div>
          </div>

          {/* Quick status indicators */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              PostgreSQL + pgvector
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              FastAPI :8080
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              Django :8000
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-1 py-2 scrollbar-none border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
