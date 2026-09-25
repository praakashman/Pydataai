"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, Sparkles, Filter, CheckCircle, RefreshCw, BarChart2 } from "lucide-react";
import { SAMPLE_DATASETS } from "@/lib/constants";

interface DataTabProps {
  datasets: any[];
  onRefresh: () => void;
}

export function DataTab({ datasets, onRefresh }: DataTabProps) {
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(
    datasets[0]?.id || null
  );
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [datasetName, setDatasetName] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"table" | "profiling" | "stats" | "clean">("profiling");

  const activeDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];

  const handleUploadSample = (sample: typeof SAMPLE_DATASETS[0]) => {
    setDatasetName(sample.name);
    setCsvContent(sample.csvText);
  };

  const handleCreateDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetName || !csvContent) return;
    setIsUploading(true);
    try {
      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: datasetName,
          csvText: csvContent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUploadModalOpen(false);
        setDatasetName("");
        setCsvContent("");
        onRefresh();
        setSelectedDatasetId(data.dataset.id);
      } else {
        alert(data.error || "Failed to upload dataset");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCleanData = async (handleNulls: "fill_mean" | "fill_zero" | "drop_rows") => {
    if (!activeDataset) return;
    setIsCleaning(true);
    try {
      const res = await fetch(`/api/datasets/${activeDataset.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clean",
          handleNulls,
          dropDuplicates: true,
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCleaning(false);
    }
  };

  const rawRows = (activeDataset?.cleanedDataJson || activeDataset?.dataJson || []) as any[];
  const columnsMeta = (activeDataset?.columnsMeta || []) as any[];
  const summaryStats = (activeDataset?.summaryStats || {}) as Record<string, any>;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Data Engine &amp; Pandas Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              CSV parsing, schema inference, missing value detection, and descriptive statistical metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dataset Selector */}
          <select
            value={selectedDatasetId || ""}
            onChange={(e) => setSelectedDatasetId(Number(e.target.value))}
            className="text-xs font-mono bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.rowCount} rows)
              </option>
            ))}
          </select>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
          >
            <Upload className="w-3.5 h-3.5" /> Upload CSV
          </button>
        </div>
      </div>

      {activeDataset ? (
        <div className="space-y-6">
          {/* Dataset Meta Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase font-mono">Total Observations</span>
              <div className="text-xl font-bold font-mono text-white mt-1">{activeDataset.rowCount}</div>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase font-mono">Features / Columns</span>
              <div className="text-xl font-bold font-mono text-white mt-1">{activeDataset.colCount}</div>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase font-mono">Memory Footprint</span>
              <div className="text-xl font-bold font-mono text-white mt-1">{activeDataset.fileSize}</div>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase font-mono">Pipeline Status</span>
              <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1 mt-1.5">
                <CheckCircle className="w-4 h-4" />
                {activeDataset.cleanedDataJson ? "Pandas Cleaned" : "Raw Ingested"}
              </div>
            </div>
          </div>

          {/* Sub Tab Navigation */}
          <div className="border-b border-slate-800 flex gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveSubTab("profiling")}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                activeSubTab === "profiling"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Automated Schema &amp; Profiling
            </button>
            <button
              onClick={() => setActiveSubTab("stats")}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                activeSubTab === "stats"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Statistical Summaries
            </button>
            <button
              onClick={() => setActiveSubTab("table")}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                activeSubTab === "table"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Tabular Data Preview
            </button>
            <button
              onClick={() => setActiveSubTab("clean")}
              className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
                activeSubTab === "clean"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Filter className="w-3.5 h-3.5" /> Data Cleaning Engine
            </button>
          </div>

          {/* Sub Tab: Profiling */}
          {activeSubTab === "profiling" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columnsMeta.map((col: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">{col.name}</span>
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                          col.type === "number"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {col.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px] pt-2 border-t border-slate-800">
                      <div>Nulls: <span className="text-slate-200">{col.nullCount}</span></div>
                      <div>Uniques: <span className="text-slate-200">{col.uniqueCount}</span></div>
                      {col.mean !== undefined && (
                        <div>Mean: <span className="text-slate-200">{col.mean}</span></div>
                      )}
                      {col.std !== undefined && (
                        <div>Std: <span className="text-slate-200">{col.std}</span></div>
                      )}
                    </div>

                    <div className="pt-2 text-slate-400 text-[11px]">
                      <span className="text-slate-500 block mb-1">Sample values:</span>
                      <div className="flex flex-wrap gap-1 font-mono">
                        {(col.sampleValues || []).slice(0, 3).map((v: any, vIdx: number) => (
                          <span key={vIdx} className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300">
                            {String(v)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub Tab: Statistical Summaries */}
          {activeSubTab === "stats" && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Descriptive Statistics Engine (SciPy &amp; NumPy)</h3>
                  <p className="text-xs text-slate-400">Mean, median, variance, standard deviation, quartiles, and IQR.</p>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">
                  POST /api/v1/statistics/describe
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Feature</th>
                      <th className="p-3">Mean</th>
                      <th className="p-3">Std Dev</th>
                      <th className="p-3">Min</th>
                      <th className="p-3">25% (Q1)</th>
                      <th className="p-3">Median (50%)</th>
                      <th className="p-3">75% (Q3)</th>
                      <th className="p-3">Max</th>
                      <th className="p-3">IQR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {Object.entries(summaryStats).map(([col, st]: any) => {
                      if (!st || st.mean === undefined) return null;
                      return (
                        <tr key={col} className="hover:bg-slate-800/40 text-slate-200">
                          <td className="p-3 font-bold text-indigo-300">{col}</td>
                          <td className="p-3">{st.mean}</td>
                          <td className="p-3">{st.std}</td>
                          <td className="p-3">{st.min}</td>
                          <td className="p-3">{st.q1}</td>
                          <td className="p-3 text-emerald-400 font-semibold">{st.median}</td>
                          <td className="p-3">{st.q3}</td>
                          <td className="p-3">{st.max}</td>
                          <td className="p-3">{st.iqr}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub Tab: Table Preview */}
          {activeSubTab === "table" && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                    <tr>
                      {columnsMeta.map((col: any) => (
                        <th key={col.name} className="p-3 whitespace-nowrap">
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {rawRows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-800/50 text-slate-300">
                        {columnsMeta.map((col: any) => (
                          <td key={col.name} className="p-3 whitespace-nowrap">
                            {row[col.name] === null ? (
                              <span className="text-amber-500 italic">null</span>
                            ) : (
                              String(row[col.name])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub Tab: Clean Engine */}
          {activeSubTab === "clean" && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-400" />
                  Automated Data Cleaning Pipeline (Pandas Engine)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Execute automated duplicate pruning and missing-value imputation routines directly through the backend data engine.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">Strategy 1: Mean Imputation</h4>
                    <p className="text-xs text-slate-400 mt-2">
                      Fills null values in numerical columns with the respective column mean. Preserves sample distribution.
                    </p>
                  </div>
                  <button
                    disabled={isCleaning}
                    onClick={() => handleCleanData("fill_mean")}
                    className="mt-4 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition disabled:opacity-50"
                  >
                    {isCleaning ? "Running Pandas Pipeline..." : "Execute Fill Mean"}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">Strategy 2: Zero Fill</h4>
                    <p className="text-xs text-slate-400 mt-2">
                      Replaces all missing entries with 0. Useful for sparse count vectors or transactional activity logs.
                    </p>
                  </div>
                  <button
                    disabled={isCleaning}
                    onClick={() => handleCleanData("fill_zero")}
                    className="mt-4 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition disabled:opacity-50"
                  >
                    Execute Fill Zero
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">Strategy 3: Drop Incomplete Rows</h4>
                    <p className="text-xs text-slate-400 mt-2">
                      Strict validation: Drops all records containing any null fields (equivalent to df.dropna()).
                    </p>
                  </div>
                  <button
                    disabled={isCleaning}
                    onClick={() => handleCleanData("drop_rows")}
                    className="mt-4 px-3 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-medium text-xs transition disabled:opacity-50"
                  >
                    Execute Drop Null Rows
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm">No datasets available. Upload a dataset or load a sample above.</p>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Upload CSV to Data Engine</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Sample datasets quick-loader */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400">Quickly load pre-packaged benchmark datasets:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_DATASETS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUploadSample(sample)}
                    className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/20"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateDataset} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Dataset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., customer_churn_analysis.csv"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">CSV Content</label>
                <textarea
                  rows={8}
                  required
                  placeholder="col1,col2,col3&#10;val1,val2,val3"
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium disabled:opacity-50"
                >
                  {isUploading ? "Processing & Profiling..." : "Process Dataset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
