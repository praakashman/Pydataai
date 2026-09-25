"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { OverviewTab } from "@/components/OverviewTab";
import { DataTab } from "@/components/DataTab";
import { MlTab } from "@/components/MlTab";
import { PyTorchTab } from "@/components/PyTorchTab";
import { RagTab } from "@/components/RagTab";
import { AgentsTab } from "@/components/AgentsTab";
import { AdminTab } from "@/components/AdminTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [overviewData, setOverviewData] = useState<any>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      const [ovRes, dsRes, mlRes, docRes] = await Promise.all([
        fetch("/api/overview"),
        fetch("/api/datasets"),
        fetch("/api/ml/train"),
        fetch("/api/documents"),
      ]);

      const [ovData, dsData, mlData, docData] = await Promise.all([
        ovRes.json(),
        dsRes.json(),
        mlRes.json(),
        docRes.json(),
      ]);

      setOverviewData(ovData);
      setDatasets(dsData.datasets || []);
      setModels(mlData.models || []);
      setDocuments(docData.documents || []);
    } catch (err) {
      console.error("Error loading platform data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={overviewData?.counts}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 font-mono text-xs">
              Bootstrapping PyDataAI Python Ecosystem &amp; PostgreSQL DB...
            </p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewTab
                overviewData={overviewData}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}
            {activeTab === "data" && (
              <DataTab datasets={datasets} onRefresh={fetchAllData} />
            )}
            {activeTab === "ml" && (
              <MlTab
                models={models}
                datasets={datasets}
                onRefresh={fetchAllData}
              />
            )}
            {activeTab === "pytorch" && <PyTorchTab models={models} />}
            {activeTab === "rag" && (
              <RagTab documents={documents} onRefresh={fetchAllData} />
            )}
            {activeTab === "agents" && <AgentsTab datasets={datasets} />}
            {activeTab === "admin" && <AdminTab />}
          </>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PyDataAI Platform · Single Unified Full-Stack Architecture v1.0</span>
          <span>PostgreSQL 16 · Django · FastAPI · Scikit-learn · PyTorch · RAG · Docker</span>
        </div>
      </footer>
    </div>
  );
}
