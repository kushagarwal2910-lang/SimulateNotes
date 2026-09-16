"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Search, ArrowRight, FileText, Trash2, AlertCircle, Sparkles, X } from "lucide-react";
import { SimulateNote } from "@/lib/simulateNotesData";
import { ModelTelemetryNav } from "@/components/ModelTelemetryNav";

interface SimulateNotesDashboardProps {
  notebooks: SimulateNote[];
  onSelectNotebook: (notebookId: string) => void;
  onCreateNewNotebook: () => void;
  onDeleteNotebook?: (notebookId: string) => void;
}

export const SimulateNotesDashboard: React.FC<SimulateNotesDashboardProps> = ({
  notebooks,
  onSelectNotebook,
  onCreateNewNotebook,
  onDeleteNotebook,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title">("recent");
  const [noteToDelete, setNoteToDelete] = useState<SimulateNote | null>(null);

  const filteredNotebooks = notebooks
    .filter(
      (nb) =>
        nb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nb.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0; // maintain recent default
    });

  const handleDeleteConfirm = () => {
    if (noteToDelete && onDeleteNotebook) {
      onDeleteNotebook(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col select-none font-sans">
      {/* SimulateNotes Home Header - Sticky with glass blur */}
      <header className="h-16 bg-black/90 backdrop-blur-md border-b border-neutral-800 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-20 shrink-0">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight text-white">
              SimulateNotes
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
              AI Science & Simulation Edition
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SimulateNotes & simulations..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors font-sans"
          />
        </div>

        {/* Right: Action */}
        <div className="flex items-center gap-3">
          {/* Token & Model Telemetry HUD */}
          <ModelTelemetryNav />

          <button
            onClick={onCreateNewNotebook}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New note</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-8 space-y-6 pb-20">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-semibold text-white tracking-tight">
                My SimulateNotes
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
                {notebooks.length} notes
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Personalized scientific workspaces grounded in Tavily RAG and live interactive simulations.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="text-[11px] text-neutral-500 font-mono">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "title")}
              className="bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs text-neutral-300 focus:outline-none focus:border-neutral-600"
            >
              <option value="recent">Most recent</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
          {/* Card 0: '+ New note' prominent card */}
          <div
            onClick={onCreateNewNotebook}
            className="h-60 rounded-2xl border border-dashed border-neutral-700 bg-neutral-950/60 hover:bg-neutral-900/60 hover:border-white cursor-pointer transition-all flex flex-col items-center justify-center text-center p-6 group shadow-sm"
          >
            <div className="w-12 h-12 rounded-full border border-neutral-700 group-hover:border-white group-hover:scale-110 bg-neutral-900 flex items-center justify-center text-neutral-400 group-hover:text-white transition-all mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
              New note
            </span>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-[160px]">
              Start research on any scientific topic
            </p>
          </div>

          {/* Existing Note Cards */}
          {filteredNotebooks.map((nb) => {
            const isCustom = !nb.id.startsWith("sn-quantum") &&
                             !nb.id.startsWith("sn-keplerian") &&
                             !nb.id.startsWith("sn-bernoulli") &&
                             !nb.id.startsWith("sn-lithium") &&
                             !nb.id.startsWith("sn-nand") &&
                             !nb.id.startsWith("sn-earth") &&
                             !nb.id.startsWith("sn-crude") &&
                             !nb.id.startsWith("sn-bayes");

            return (
              <div
                key={nb.id}
                onClick={() => onSelectNotebook(nb.id)}
                className="h-60 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-500 hover:bg-neutral-900/70 cursor-pointer transition-all p-5 flex flex-col justify-between group relative shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      {isCustom && (
                        <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/60 text-sky-400 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Generated</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
                        {nb.sources.length} {nb.sources.length === 1 ? "source" : "sources"}
                      </span>

                      {/* Delete Option */}
                      {onDeleteNotebook && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNoteToDelete(nb);
                          }}
                          title="Delete note"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-white line-clamp-2 leading-snug">
                      {nb.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                      {nb.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>{nb.date}</span>
                  <span className="flex items-center gap-1 text-neutral-400 group-hover:text-white transition-colors font-sans text-xs">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setNoteToDelete(null);
          }}
        >
          <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setNoteToDelete(null)}
                className="p-1 rounded text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">
                Delete SimulateNote?
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Are you sure you want to delete <span className="text-white font-medium">&quot;{noteToDelete.title}&quot;</span>? This will permanently remove its indexed sources, RAG database, and simulation context.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNoteToDelete(null)}
                className="px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors shadow-sm"
              >
                Delete note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Backwards compatibility alias
export const NotebookDashboard = SimulateNotesDashboard;
