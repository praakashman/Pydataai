"use client";

import { useState } from "react";
import { FileText, Send, Sparkles, BookOpen, Layers, CheckCircle2, Upload, MessageSquare } from "lucide-react";

interface RagTabProps {
  documents: any[];
  onRefresh: () => void;
}

export function RagTab({ documents, onRefresh }: RagTabProps) {
  const [selectedDocId, setSelectedDocId] = useState<number | null>(
    documents[0]?.id || null
  );

  // Chat State
  const [query, setQuery] = useState("What is the company leave policy?");
  const [chatLog, setChatLog] = useState<
    { sender: "user" | "assistant"; text: string; citations?: any[] }[]
  >([
    {
      sender: "assistant",
      text: "Hello! I am connected to your PostgreSQL + pgvector RAG database. Ask any question about your indexed documents.",
    },
  ]);
  const [isQuerying, setIsQuerying] = useState(false);

  // Document Upload State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleSendQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isQuerying) return;

    const userMessage = query;
    setQuery("");
    setChatLog((prev) => [...prev, { sender: "user", text: userMessage }]);
    setIsQuerying(true);

    try {
      const res = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage,
          documentId: activeDoc?.id || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: data.answer,
            citations: data.retrievedChunks,
          },
        ]);
      } else {
        setChatLog((prev) => [
          ...prev,
          { sender: "assistant", text: "Error: " + (data.error || "Failed to retrieve RAG response.") },
        ]);
      }
    } catch (err: any) {
      setChatLog((prev) => [
        ...prev,
        { sender: "assistant", text: "Error connecting to RAG gateway: " + err.message },
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docContent) return;
    setIsUploading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: docTitle,
          content: docContent,
          fileType: "pdf",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUploadModalOpen(false);
        setDocTitle("");
        setDocContent("");
        onRefresh();
        setSelectedDocId(data.document.id);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              GenAI Layer &amp; RAG System (Retrieval-Augmented Generation)
            </h2>
            <p className="text-xs text-slate-400">
              Document chunking, sentence embeddings, PostgreSQL + pgvector similarity ranking, and cited LLM responses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDocId || ""}
            onChange={(e) => setSelectedDocId(Number(e.target.value))}
            className="text-xs font-mono bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.chunkCount} chunks)
              </option>
            ))}
          </select>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chat Console (2 cols) */}
        <div className="lg:col-span-2 space-y-4 flex flex-col h-[650px] bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-white">RAG Knowledge Assistant</span>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded">
              Active Store: PostgreSQL + pgvector
            </div>
          </div>

          {/* Quick Query Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400">Try asking:</span>
            {[
              "What is the company leave policy?",
              "What are the ML governance criteria?",
              "How does pgvector handle embeddings?",
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(q);
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 hover:border-cyan-500/40 transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-4 p-2 scrollbar-none font-mono text-xs">
            {chatLog.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-950 border border-slate-800 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Render citations if present */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> pgvector Match Citations ({msg.citations.length}):
                      </span>
                      {msg.citations.map((c: any, cIdx: number) => (
                        <div
                          key={cIdx}
                          className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400"
                        >
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Chunk #{c.chunkIndex}</span>
                            <span className="text-cyan-400 font-bold">Similarity: {(c.score * 100).toFixed(0)}%</span>
                          </div>
                          &quot;{c.chunkText}&quot;
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isQuerying && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                Searching vector index and synthesizing LLM response...
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendQuery} className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about the indexed documents..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              type="submit"
              disabled={isQuerying || !query.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-2 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>

        {/* Right Column: RAG Pipeline Specifications */}
        <div className="space-y-6">
          {/* Active Document Details */}
          {activeDoc && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Indexed Document Details
              </h3>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-slate-200 font-bold">{activeDoc.title}</div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>File: {activeDoc.filename}</span>
                  <span>Size: {activeDoc.fileSize}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                  <span>Chunks: <strong className="text-cyan-400">{activeDoc.chunkCount}</strong></span>
                  <span>Format: <strong className="text-indigo-400">{activeDoc.fileType.toUpperCase()}</strong></span>
                </div>
              </div>

              {/* RAG Lifecycle Flow */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  RAG Execution Pipeline
                </span>
                {[
                  "1. Text Ingestion & Parsing",
                  "2. Chunking (Overlap: 40 tokens)",
                  "3. Vector Embedding Generation",
                  "4. PostgreSQL + pgvector Storage",
                  "5. Cosine Similarity Ranker",
                  "6. Grounded LLM Response",
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Ingest Document for RAG Vector Indexing</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Enterprise Data Security Standard"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Document Text Body</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Paste documentation text or policy clauses here..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
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
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium disabled:opacity-50"
                >
                  {isUploading ? "Chunking & Generating Embeddings..." : "Index in pgvector"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
