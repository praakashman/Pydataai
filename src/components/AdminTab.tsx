"use client";

import { useState, useEffect } from "react";
import { Database, ShieldCheck, Activity, Terminal, Server, Code, Layers } from "lucide-react";

export function AdminTab() {
  const [systemData, setSystemData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/system")
      .then((res) => res.json())
      .then((data) => {
        setSystemData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const services = systemData?.services || [
    { name: "Django Admin & Core", status: "Healthy", uptime: "99.98%", port: "8000" },
    { name: "FastAPI AI/ML Gateway", status: "Healthy", uptime: "99.95%", port: "8080" },
    { name: "PostgreSQL 16 + pgvector", status: "Connected", connections: "14/100", port: "5432" },
    { name: "Redis Queue & Cache", status: "Active", pendingTasks: 0, port: "6379" },
    { name: "Celery Worker Process", status: "Idle", workers: 4, concurrency: 8 },
  ];

  const auditLogs = systemData?.auditLogs || [];
  const users = systemData?.users || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Django Admin Management, Security &amp; API Explorer
            </h2>
            <p className="text-xs text-slate-400">
              Django authentication, RBAC authorization, PostgreSQL database health, and live REST telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            Django 5.0 Core · Role: ADMIN
          </span>
        </div>
      </div>

      {/* Services Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {services.map((svc: any, idx: number) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-bold">{svc.name}</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[11px] text-slate-400">
              Status: <span className="text-emerald-400">{svc.status}</span>
            </div>
            <div className="text-[11px] text-slate-400">Port: {svc.port}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Django Users & RBAC */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Server className="w-4 h-4 text-emerald-400" />
            Django User Profiles &amp; Permissions
          </h3>

          <div className="space-y-3">
            {users.map((u: any) => (
              <div
                key={u.id}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-slate-200">{u.name}</div>
                  <div className="text-[11px] text-slate-400">{u.email}</div>
                  <div className="text-[10px] text-slate-500">{u.department}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    u.role === "ADMIN"
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: FastAPI vs Django Architectural Division */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-mono">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-indigo-400" />
            Framework Responsibilities Division
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 block border-b border-slate-800 pb-1">
                Django Responsibilities
              </span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• Authentication &amp; JWT</li>
                <li>• Admin Dashboard</li>
                <li>• User Roles &amp; Teams</li>
                <li>• Database Schema Migrations</li>
                <li>• Business Logic Rules</li>
                <li>• Audit Trail Governance</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-teal-400 block border-b border-slate-800 pb-1">
                FastAPI Responsibilities
              </span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• ML Model Inference</li>
                <li>• PyTorch Tensor Compute</li>
                <li>• Real-time Data Ingestion</li>
                <li>• RAG Vector Retrieval</li>
                <li>• Autonomous Agent Loops</li>
                <li>• Async High Throughput</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Real-Time Audit Log */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            PostgreSQL Audit Trail &amp; Service Telemetry
          </span>
          <span className="text-[11px] text-slate-400">Live PostgreSQL `audit_logs` table</span>
        </div>

        <div className="overflow-x-auto max-h-60 rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2.5">Service</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Latency</th>
                <th className="p-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {auditLogs.slice(0, 10).map((log: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="p-2.5 font-bold text-indigo-300">{log.service}</td>
                  <td className="p-2.5">{log.action}</td>
                  <td className="p-2.5 text-emerald-400">HTTP {log.statusCode || 200}</td>
                  <td className="p-2.5">{log.latencyMs}ms</td>
                  <td className="p-2.5 text-slate-500">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
