"use client";

import React, { useState } from "react";
import { ArrowLeft, BookOpen, PanelRight, Plus, Share2, Loader2, Check, Trash2, X } from "lucide-react";
import { ModelTelemetryNav } from "@/components/ModelTelemetryNav";

interface SimulateNotesHeaderProps {
  currentTopic: string;
  sourceCount: number;
  isStudioOpen: boolean;
  onToggleStudio: () => void;
  onBackToDashboard: () => void;
  onNewNotebook: () => void;
  onDeleteNotebook?: () => void;
  isAgent1Searching: boolean;
}

export const SimulateNotesHeader: React.FC<SimulateNotesHeaderProps> = ({
  currentTopic,
  sourceCount,
  isStudioOpen,
  onToggleStudio,
  onBackToDashboard,
  onNewNotebook,
  onDeleteNotebook,
  isAgent1Searching,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    if (onDeleteNotebook) {
      onDeleteNotebook();
    }
  };

  return (
    <header className="h-14 bg-black border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Back to Dashboard & Note Title */}
      <div className="flex items-center gap-3">
        {/* Back to Notes Button (Returns to Home Page Dashboard!) */}
        <button
          onClick={onBackToDashboard}
          title="Back to all SimulateNotes"
          className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-neutral-300" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {currentTopic}
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 shrink-0">
                {sourceCount} sources
              </span>
            </div>
            {isAgent1Searching ? (
              <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Crawling Tavily web sources...
              </span>
            ) : (
              <span className="text-[10px] text-neutral-500 font-mono hidden sm:block">
                SIMULATENOTES // SCIENTIFIC SIMULATION ENGINE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Token & Model Telemetry HUD */}
        <ModelTelemetryNav />

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
          title="Share SimulateNote link"
        >
          {copiedShare ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copiedShare ? "Copied" : "Share"}</span>
        </button>

        {/* Studio View Toggle Button */}
        <button
          onClick={onToggleStudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
            isStudioOpen
              ? "bg-white text-black border-white"
              : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 hover:text-white"
          }`}
          title="Toggle Simulation Studio Panel"
        >
          <PanelRight className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Studio</span>
        </button>

        {/* Delete Note Option */}
        {onDeleteNotebook && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-1.5 rounded-full border border-neutral-800 bg-neutral-950 hover:bg-red-950/40 hover:border-red-900/50 text-neutral-500 hover:text-red-400 transition-colors"
            title="Delete this SimulateNote"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* New Note Button */}
        <button
          onClick={onNewNotebook}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-medium transition-colors ml-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Note</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false);
          }}
        >
          <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">Delete SimulateNote?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Are you sure you want to delete <span className="text-white font-medium">&quot;{currentTopic}&quot;</span>? This will permanently remove its indexed sources, RAG database, and simulation context.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors shadow-sm"
              >
                Delete note
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Backwards compatibility alias
export const NotebookHeader = SimulateNotesHeader;
