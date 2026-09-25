"use client";

import { useState } from "react";
import { Activity, Flame, Cpu, Terminal, TrendingUp, Layers, CheckCircle } from "lucide-react";

interface PyTorchTabProps {
  models: any[];
}

export function PyTorchTab({ models }: PyTorchTabProps) {
  const dlModels = models.filter((m) => m.taskType === "deep_learning");
  const [selectedModel] = useState<any>(dlModels[0] || models[0]);

  const metrics = selectedModel?.metrics || {};
  const epochsLog = metrics.epochsLog || [
    { epoch: 1, loss: 0.69, valLoss: 0.67, accuracy: 0.62 },
    { epoch: 3, loss: 0.54, valLoss: 0.51, accuracy: 0.76 },
    { epoch: 6, loss: 0.38, valLoss: 0.35, accuracy: 0.86 },
    { epoch: 10, loss: 0.24, valLoss: 0.22, accuracy: 0.91 },
    { epoch: 15, loss: 0.16, valLoss: 0.15, accuracy: 0.935 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              PyTorch Deep Learning Engine
            </h2>
            <p className="text-xs text-slate-400">
              PyTorch tensors, GPU hardware acceleration, autograd backpropagation, loss optimization, and epoch checkpointing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
            PyTorch v2.3 · CUDA Enabled
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Model Architecture & Loss Progression */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Neural Network Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">PyTorch Deep Artificial Neural Network (ANN)</h3>
                <p className="text-xs font-mono text-slate-400">
                  Target: Customer Churn Probability · Input Dimensions: 3 Features
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Status: Converged (Epoch 15/15)
              </span>
            </div>

            {/* Neural Net Architecture Visualizer */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
              <div className="font-semibold text-rose-400 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" /> PyTorch Module Definition:
              </div>
              <pre className="text-[11px] leading-relaxed text-slate-400 overflow-x-auto">
{`class CustomerChurnNet(nn.Module):
    def __init__(self, input_dim=3, hidden_dim=64):
        super(CustomerChurnNet, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(p=0.2)
        self.fc2 = nn.Linear(hidden_dim, 32)
        self.fc3 = nn.Linear(32, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.dropout(self.relu(self.fc1(x)))
        x = self.relu(self.fc2(x))
        return self.sigmoid(self.fc3(x))`}
              </pre>
            </div>

            {/* Training Loss Table & Epoch History */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-400" />
                Epoch Loss &amp; Validation Convergence
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Epoch</th>
                      <th className="p-2.5">Training Loss (BCE)</th>
                      <th className="p-2.5">Validation Loss</th>
                      <th className="p-2.5">Val Accuracy</th>
                      <th className="p-2.5">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {epochsLog.map((log: any) => (
                      <tr key={log.epoch} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold text-rose-400">Epoch {log.epoch}</td>
                        <td className="p-2.5">{log.loss}</td>
                        <td className="p-2.5">{log.valLoss}</td>
                        <td className="p-2.5 text-emerald-400 font-semibold">{(log.accuracy * 100).toFixed(1)}%</td>
                        <td className="p-2.5 w-32">
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-rose-500 to-indigo-500 h-full rounded-full"
                              style={{ width: `${log.accuracy * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: PyTorch Pipeline Specs */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-rose-400" />
              PyTorch Pipeline Lifecycle
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {[
                { step: "1. Dataset & DataLoader", desc: "Batch size: 32, Shuffle: True, Tensor normalization" },
                { step: "2. Criterion & Optimizer", desc: "nn.BCELoss(), optim.AdamW(lr=1e-3, weight_decay=1e-4)" },
                { step: "3. Autograd & Backprop", desc: "loss.backward() -> optimizer.step() -> zero_grad()" },
                { step: "4. Checkpoint Serialization", desc: "torch.save(model.state_dict(), 'models/churn.pth')" },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-rose-400 font-bold">{item.step}</div>
                  <div className="text-slate-400 text-[11px]">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold">PyTorch Device:</span>
                <span className="text-emerald-400">cuda:0 (NVIDIA A10G)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold">Tensor Memory:</span>
                <span className="text-slate-400">142 MB allocated</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold">Inference Speed:</span>
                <span className="text-cyan-400">4.8ms / batch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
