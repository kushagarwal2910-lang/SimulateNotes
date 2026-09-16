"use client";

import React from "react";
import { X, ExternalLink, Globe, Play, BookOpen, Layers, Check } from "lucide-react";
import { SourceDocument } from "@/lib/notebookTypes";

interface SourceReaderModalProps {
  source: SourceDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onLoadSimulation: (slug: string) => void;
}

export const SourceReaderModal: React.FC<SourceReaderModalProps> = ({
  source,
  isOpen,
  onClose,
  onLoadSimulation,
}) => {
  if (!isOpen || !source) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl bg-black border border-neutral-800 rounded-2xl flex flex-col max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <Globe className="w-4 h-4 text-neutral-300" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-semibold text-white tracking-tight truncate">
                {source.title}
              </h3>
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                <span>{source.domain}</span>
                <span>•</span>
                <span>{source.chunks} chunks in RAG DB</span>
                <span>•</span>
                <span>{source.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
              title="Open external source"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-neutral-300 text-xs sm:text-sm">
          {/* Metadata Card */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-neutral-500 block text-[10px]">RELEVANCE</span>
                <span className="text-white font-medium">{source.relevance}% match</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">INDEXED</span>
                <span className="text-white font-medium">{source.dateAdded}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">CHUNKS</span>
                <span className="text-white font-medium">{source.chunks} vector segments</span>
              </div>
            </div>

            {source.simulationSlug && (
              <button
                onClick={() => {
                  if (source.simulationSlug) onLoadSimulation(source.simulationSlug);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black font-medium text-xs transition-colors font-sans"
              >
                <Play className="w-3 h-3 fill-black" />
                <span>Launch in Studio</span>
              </button>
            )}
          </div>

          {/* Full Abstract / Snippet */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
              Indexed Excerpt & Theoretical Formulation
            </h4>
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 leading-relaxed font-sans text-neutral-200 text-sm whitespace-pre-line">
              {source.snippet}
            </div>
          </div>

          {/* RAG Context Retrieval Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
              Grounding in Notebook Chat
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              This document is indexed in your local hybrid RAG database. When you ask questions in this notebook, Agent 1 retrieves segments from this source to ground mathematical derivations and answer citations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
