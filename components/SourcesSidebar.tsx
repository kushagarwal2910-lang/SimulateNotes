"use client";

import React from "react";
import { Plus, Globe, ExternalLink, ArrowRight, Loader2, CheckSquare, Square, Eye } from "lucide-react";
import { SourceDocument } from "@/lib/notebookTypes";

interface SourcesSidebarProps {
  sources: SourceDocument[];
  activeSourceId: string | null;
  selectedSourceIds: Set<string>;
  onToggleSelectSource: (sourceId: string) => void;
  onSelectAllSources: (selectAll: boolean) => void;
  onSelectSource: (source: SourceDocument) => void;
  onViewSourceDetails: (source: SourceDocument) => void;
  onOpenAddSourceModal: () => void;
  isSearching: boolean;
  onLoadSimulation: (slug: string) => void;
}

export const SourcesSidebar: React.FC<SourcesSidebarProps> = ({
  sources,
  activeSourceId,
  selectedSourceIds,
  onToggleSelectSource,
  onSelectAllSources,
  onSelectSource,
  onViewSourceDetails,
  onOpenAddSourceModal,
  isSearching,
  onLoadSimulation,
}) => {
  const allSelected = sources.length > 0 && selectedSourceIds.size === sources.length;

  return (
    <aside className="w-72 md:w-80 h-full bg-black border-r border-neutral-800 flex flex-col select-none shrink-0 overflow-hidden">
      {/* Top Header & Prominent '+ Add source' button (NotebookLM Style) */}
      <div className="p-4 border-b border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white tracking-tight">Sources</h2>
          <span className="text-xs font-mono text-neutral-500">{sources.length}</span>
        </div>

        {/* NotebookLM Signature "+ Add source" Button */}
        <button
          onClick={onOpenAddSourceModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-neutral-700 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-500 text-white text-xs font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add source</span>
        </button>

        {/* Select All Checkbox */}
        <div className="flex items-center justify-between pt-1 text-xs text-neutral-400">
          <button
            onClick={() => onSelectAllSources(!allSelected)}
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-white" />
            ) : (
              <Square className="w-3.5 h-3.5 text-neutral-500" />
            )}
            <span className="text-[11px]">Select all sources</span>
          </button>
          <span className="text-[10px] font-mono text-neutral-500">
            {selectedSourceIds.size}/{sources.length} active
          </span>
        </div>
      </div>

      {/* Crawl Status Banner */}
      {isSearching && (
        <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center gap-2.5 text-xs text-neutral-300 font-mono">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
          <span className="text-[11px] leading-tight">Agent 1: Crawling 25-30 web sources via Tavily...</span>
        </div>
      )}

      {/* Sources List (NotebookLM Card Style) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sources.length === 0 && !isSearching && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 my-8">
            <Globe className="w-8 h-8 mb-3 text-neutral-700 stroke-[1.5]" />
            <p className="text-xs font-medium text-neutral-300">No sources indexed yet</p>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-[200px] leading-relaxed">
              Ask a question or enter a research topic in the chat to crawl Tavily web sources and fill this index.
            </p>
          </div>
        )}

        {sources.map((source, index) => {
          const isChecked = selectedSourceIds.has(source.id);
          const isActive = activeSourceId === source.id;

          return (
            <div
              key={source.id}
              onClick={() => {
                onSelectSource(source);
                onViewSourceDetails(source);
              }}
              className={`p-3 rounded-xl cursor-pointer border transition-all text-left group ${
                isActive
                  ? "bg-neutral-900 border-white text-white"
                  : isChecked
                  ? "bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40 text-neutral-300"
                  : "bg-neutral-950/40 border-neutral-900 opacity-60 hover:opacity-100 text-neutral-400"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Source Selection Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelectSource(source.id);
                  }}
                  className="mt-0.5 text-neutral-400 hover:text-white shrink-0"
                  title={isChecked ? "Unselect source" : "Select source"}
                >
                  {isChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-neutral-600" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                    <Globe className="w-3 h-3 shrink-0" />
                    <span className="truncate">{source.domain}</span>
                  </div>

                  <h3 className="text-xs font-medium text-white mt-1 line-clamp-2 leading-snug">
                    {source.title}
                  </h3>

                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed font-light">
                    {source.snippet}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-500 font-mono">
                    <span className="flex items-center gap-1 hover:text-white">
                      <Eye className="w-3 h-3" />
                      <span>{source.chunks} chunks</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {source.simulationSlug && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (source.simulationSlug) {
                              onLoadSimulation(source.simulationSlug);
                            }
                          }}
                          className="text-white hover:underline flex items-center gap-0.5 font-sans font-medium"
                        >
                          <span>Sim</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-neutral-500 hover:text-white"
                        title="Open original publication"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Source Summary Note */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-950 text-[11px] text-neutral-400 space-y-1">
        <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500">
          <span>RAG HYBRID INDEX</span>
          <span>AUTONOMOUS AGENT 1</span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-tight">
          Click any source card to view full indexed text & mathematical formulations.
        </p>
      </div>
    </aside>
  );
};
