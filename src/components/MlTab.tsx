"use client";

import { useState } from "react";
import { Cpu, Play, CheckCircle2, Sliders, Target, Sparkles, Send, Activity } from "lucide-react";

interface MlTabProps {
  models: any[];
  datasets: any[];
  onRefresh: () => void;
}

export function MlTab({ models, datasets, onRefresh }: MlTabProps) {
  const [selectedModelId, setSelectedModelId] = useState<number | null>(
    models[0]?.id || null
  );

  // Training Form State
  const [trainModalOpen, setTrainModalOpen] = useState(false);
  const [modelName, setModelName] = useState("RandomForest_CustomerRetention_v2");
  const [datasetId, setDatasetId] = useState<number>(datasets[0]?.id || 1);
  const [algorithm, setAlgorithm] = useState("RandomForestClassifier");
  const [taskType, setTaskType] = useState<"classification" | "regression">("classification");
  const [isTraining, setIsTraining] = useState(false);

  // Inference Playground State
  const [inferenceInput, setInferenceInput] = useState<Record<string, any>>({
    age: 35,
    tenure_months: 6,
    monthly_charges: 85.0,
    contract_type: "Month-to-month",
  });
  const [inferenceResult, setInferenceResult] = useState<any>(null);
  const [isInferring, setIsInferring] = useState(false);

  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];

  const handleTrainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selDataset = datasets.find((d) => d.id === Number(datasetId));
    if (!selDataset) return;

    setIsTraining(true);
    const cols = ((selDataset.columnsMeta as any[]) || []).map((c: any) => c.name);
    const target = cols.find((c) => c.toLowerCase().includes("churn") || c.toLowerCase().includes("price") || c.toLowerCase().includes("target")) || cols[cols.length - 1];
    const features = cols.filter((c) => c !== target);

    try {
      const res = await fetch("/api/ml/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modelName,
          algorithm,
          taskType,
          datasetId: Number(datasetId),
          targetColumn: target,
          featureColumns: features,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTrainModalOpen(false);
        onRefresh();
        setSelectedModelId(data.model.id);
      } else {
        alert(data.error || "Training failed");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsTraining(false);
    }
  };

  const handlePredict = async () => {
    if (!activeModel) return;
    setIsInferring(true);
    try {
      const res = await fetch("/api/ml/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: activeModel.id,
          inputFeatures: inferenceInput,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setInferenceResult(data);
      } else {
        alert(data.error || "Prediction request failed");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsInferring(false);
    }
  };

  const metrics = (activeModel?.metrics || {}) as any;
  const featureImp = (metrics.featureImportance || []) as any[];
  const cm = metrics.confusionMatrix;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Scikit-learn Machine Learning Layer &amp; Model Registry
            </h2>
            <p className="text-xs text-slate-400">
              Random Forest, Gradient Boosting, Logistic Regression with confusion matrix and live inference API.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <select
            value={selectedModelId || ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedModelId(id);
              setInferenceResult(null);
            }}
            className="text-xs font-mono bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.algorithm})
              </option>
            ))}
          </select>

          <button
            onClick={() => setTrainModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Train New Model
          </button>
        </div>
      </div>

      {activeModel ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Model Details & Metrics (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Model Card Header */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{activeModel.name}</h3>
                  <p className="text-xs font-mono text-purple-400 mt-0.5">
                    Algorithm: {activeModel.algorithm} · Task: {activeModel.taskType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Registry: {activeModel.version}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {activeModel.artifactPath}
                  </span>
                </div>
              </div>

              {/* Metric KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Accuracy</span>
                  <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                    {metrics.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : "N/A"}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Precision</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {metrics.precision ? `${(metrics.precision * 100).toFixed(1)}%` : "N/A"}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Recall</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    {metrics.recall ? `${(metrics.recall * 100).toFixed(1)}%` : "N/A"}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase font-mono text-slate-400">F1 Score</span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    {metrics.f1 ? metrics.f1.toFixed(3) : "N/A"}
                  </div>
                </div>
              </div>

              {/* Confusion Matrix & Feature Importance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Confusion Matrix */}
                {cm && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">Scikit-learn Confusion Matrix</span>
                    <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs mt-2">
                      <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                        <div className="text-[10px] text-slate-400">True Neg (TN)</div>
                        <div className="text-base font-bold">{cm.matrix[0][0]}</div>
                      </div>
                      <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/20 text-rose-300">
                        <div className="text-[10px] text-slate-400">False Pos (FP)</div>
                        <div className="text-base font-bold">{cm.matrix[0][1]}</div>
                      </div>
                      <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/20 text-rose-300">
                        <div className="text-[10px] text-slate-400">False Neg (FN)</div>
                        <div className="text-base font-bold">{cm.matrix[1][0]}</div>
                      </div>
                      <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                        <div className="text-[10px] text-slate-400">True Pos (TP)</div>
                        <div className="text-base font-bold">{cm.matrix[1][1]}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feature Importance Attribution */}
                {featureImp.length > 0 && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">Relative Feature Weights</span>
                    <div className="space-y-2 mt-2">
                      {featureImp.slice(0, 4).map((f: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono text-slate-400">
                            <span>{f.feature}</span>
                            <span className="text-purple-400">{(f.importance * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, f.importance * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FastAPI Endpoint Documentation Spec Box */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold flex items-center gap-1.5 text-indigo-400">
                  <Activity className="w-3.5 h-3.5" /> FastAPI Live REST Specification
                </span>
                <span className="text-emerald-400 text-[10px]">p95 Latency &lt; 20ms</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg text-slate-400 overflow-x-auto">
                <code>
                  POST /api/v1/ml/predict<br />
                  Content-Type: application/json<br />
                  Body: &#123; &quot;model_id&quot;: {activeModel.id}, &quot;input_features&quot;: &#123; ... &#125; &#125;
                </code>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Prediction Playground */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Live Inference Playground
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Pass candidate features into the trained model artifact to evaluate real-time model output.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Customer Age</label>
                <input
                  type="number"
                  value={inferenceInput.age || 35}
                  onChange={(e) =>
                    setInferenceInput({ ...inferenceInput, age: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tenure (Months)</label>
                <input
                  type="number"
                  value={inferenceInput.tenure_months || 6}
                  onChange={(e) =>
                    setInferenceInput({ ...inferenceInput, tenure_months: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Monthly Charges ($)</label>
                <input
                  type="number"
                  value={inferenceInput.monthly_charges || 85}
                  onChange={(e) =>
                    setInferenceInput({ ...inferenceInput, monthly_charges: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Contract Type</label>
                <select
                  value={inferenceInput.contract_type || "Month-to-month"}
                  onChange={(e) =>
                    setInferenceInput({ ...inferenceInput, contract_type: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="One year">One year</option>
                  <option value="Two year">Two year</option>
                </select>
              </div>

              <button
                onClick={handlePredict}
                disabled={isInferring}
                className="w-full mt-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isInferring ? "Invoking FastAPI Worker..." : "Invoke Prediction Endpoint"}
              </button>
            </div>

            {/* Inference Output Box */}
            {inferenceResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-indigo-500/30 font-mono space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Classification Result:</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {inferenceResult.latencyMs}ms latency
                  </span>
                </div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  {inferenceResult.prediction}
                </div>
                {inferenceResult.confidence && (
                  <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
                    Confidence probability: <span className="text-indigo-400 font-bold">{(inferenceResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm">No models registered yet. Click &quot;Train New Model&quot; to begin.</p>
        </div>
      )}

      {/* Train Modal */}
      {trainModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Train Scikit-Learn Model</h3>
              <button
                onClick={() => setTrainModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTrainSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Training Dataset</label>
                <select
                  value={datasetId}
                  onChange={(e) => setDatasetId(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  {datasets.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.rowCount} records)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Algorithm</label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="RandomForestClassifier">Random Forest (Scikit-Learn)</option>
                  <option value="GradientBoosting">Gradient Boosting (Scikit-Learn)</option>
                  <option value="LogisticRegression">Logistic Regression</option>
                  <option value="SVM">Support Vector Machine (SVM)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTrainModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTraining}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium disabled:opacity-50"
                >
                  {isTraining ? "Fitting Scikit-Learn Pipeline..." : "Start Training"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
