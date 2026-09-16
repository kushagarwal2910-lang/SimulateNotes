"use client";

import React, { useState } from "react";
import { X, Globe, Database, FileText, Search, Plus, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { SIMULATIONS_CATALOG } from "@/lib/simulationsData";
import { SourceDocument } from "@/lib/simulateNotesTypes";

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string;
  onSourcesAdded: (newSources: SourceDocument[], topicTitle: string) => void;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  notebookId,
  onSourcesAdded,
}) => {
  const [activeTab, setActiveTab] = useState<"tavily" | "library" | "paste">("tavily");
  const [tavilyQuery, setTavilyQuery] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [isIndexing, setIsIndexing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Submit Tavily Search to Index Sources
  const handleTavilySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tavilyQuery.trim() || isIndexing) return;

    setIsIndexing(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/sources/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId,
          topic: tavilyQuery.trim(),
          type: "tavily",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to index sources");
      }

      onSourcesAdded(data.sources || [], data.topicTitle || tavilyQuery.trim());
      setTavilyQuery("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Network error indexing sources.");
    } finally {
      setIsIndexing(false);
    }
  };

  // 2. Submit Pasted Text
  const handlePasteSubmit = async () => {
    if (!pastedText.trim() || isIndexing) return;

    setIsIndexing(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/sources/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId,
          text: pastedText.trim(),
          type: "paste",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to index pasted notes");
      }

      onSourcesAdded(data.sources || [], data.topicTitle || "Custom Notes");
      setPastedText("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Error saving custom notes.");
    } finally {
      setIsIndexing(false);
    }
  };

  // 3. Submit Library Simulation Package
  const handleLibrarySelect = async (simSlug: string) => {
    if (isIndexing) return;

    setIsIndexing(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/sources/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId,
          simSlug,
          type: "library",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load library source");
      }

      onSourcesAdded(data.sources || [], data.topicTitle);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Error adding library source.");
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isIndexing) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-black border border-neutral-800 rounded-2xl flex flex-col max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Add sources to notebook</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Build your notebook&apos;s verified RAG database. Questions and simulations will be grounded strictly in these sources.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isIndexing}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error alert if any */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800/80 flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 px-6 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab("tavily")}
            disabled={isIndexing}
            className={`py-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "tavily"
                ? "border-white text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Tavily Web Search (Index RAG)</span>
          </button>
          <button
            onClick={() => setActiveTab("library")}
            disabled={isIndexing}
            className={`py-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "library"
                ? "border-white text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Simulation Packages</span>
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            disabled={isIndexing}
            className={`py-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "paste"
                ? "border-white text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text / Formulas</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "tavily" && (
            <form onSubmit={handleTavilySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Research Topic or Scientific Concept to Index:
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={tavilyQuery}
                    onChange={(e) => setTavilyQuery(e.target.value)}
                    disabled={isIndexing}
                    placeholder="e.g. Doppler effect in sound waves, fluid flow in venturi tube..."
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white font-sans disabled:opacity-60"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Tavily will crawl authoritative academic publications, chunk the contents, and create a localized RAG database for this note. <span className="text-neutral-400 font-medium">No simulation will be generated until you query it from the chat.</span>
                </p>
              </div>

              {isIndexing && (
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3 text-xs text-sky-400 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
                  <span>Crawling Tavily sources and indexing RAG database...</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isIndexing || !tavilyQuery.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-medium text-xs transition-colors disabled:opacity-40"
                >
                  {isIndexing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Indexing RAG Database...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Index Sources via Tavily</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "library" && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-400">
                Index verified scientific simulation models and their mathematical formulations into this notebook:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SIMULATIONS_CATALOG.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => handleLibrarySelect(sim.slug)}
                    className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                      <span>{sim.category}</span>
                      <span className="text-neutral-500">{sim.keyParameters.length} params</span>
                    </div>
                    <h4 className="text-xs font-medium text-white mt-1 line-clamp-1">{sim.title}</h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{sim.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "paste" && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-neutral-300">
                Paste raw scientific documentation, lecture notes, or formulas:
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                disabled={isIndexing}
                rows={6}
                placeholder="Paste LaTeX formulas, physical principles, or equations..."
                className="w-full p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white font-mono resize-none disabled:opacity-60"
              />
              <div className="flex justify-end">
                <button
                  onClick={handlePasteSubmit}
                  disabled={isIndexing || !pastedText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-medium text-xs transition-colors disabled:opacity-40"
                >
                  {isIndexing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Indexing Notes...</span>
                    </>
                  ) : (
                    <span>Insert Custom Text</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
