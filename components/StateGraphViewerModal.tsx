"use client";

import React from "react";
import { X, GitBranch, ArrowRight, CheckCircle2, RefreshCw, Cpu, Database, Sparkles, Layers } from "lucide-react";

interface StateGraphViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRag: () => void;
  onOpenCodeAgent: () => void;
}

export const StateGraphViewerModal: React.FC<StateGraphViewerModalProps> = ({
  isOpen,
  onClose,
  onOpenRag,
  onOpenCodeAgent,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl liquid-panel rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center text-sky-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Dual LangGraph Agent Architecture</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-sky-300">
                  StateGraph Spec & Code Pipeline
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                End-to-end scientific literature extraction, mathematical formalization, and self-healing code generation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm text-gray-300">
          {/* Section 1: Agent 1 - RAG Spec Synthesizer */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-white text-base">Agent 1: RAG Spec Synthesizer Agent</h3>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenRag();
                }}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                <span>Launch Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Bridges raw natural language topics into dense, verified JSON specifications using Tavily web search (strictly 25-30 authoritative papers), a local hybrid RAG index, and OpenRouter high-context LLMs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <div className="text-sky-300 font-bold">1. Tavily Planner</div>
                <div className="text-[10px] text-gray-500 mt-1">28 Web Documents</div>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <div className="text-sky-300 font-bold">2. Local RAG</div>
                <div className="text-[10px] text-gray-500 mt-1">Top-16 Math Chunks</div>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <div className="text-sky-300 font-bold">3. Spec Synthesis</div>
                <div className="text-[10px] text-gray-500 mt-1">Gemini 2.0 Flash</div>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-center">
                <div className="text-emerald-400 font-bold">4. Self-Healing</div>
                <div className="text-[10px] text-gray-500 mt-1">Pydantic Verified</div>
              </div>
            </div>
          </div>

          {/* Section 2: Agent 2 - LangGraph Simulation Code Generator */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Agent 2: LangGraph Code Generator Agent</h3>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenCodeAgent();
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>Launch Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Consumes the structured JSON simulation prompt, synthesizes the React 18 + GSAP architecture, writes clean SVG components, performs AST delimiter syntax validation, and triggers autonomous self-healing loops if defects are caught.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-center">
                <div className="text-emerald-300 font-bold">parse_input</div>
                <div className="text-[9px] text-gray-500">Schema Check</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-center">
                <div className="text-emerald-300 font-bold">architect</div>
                <div className="text-[9px] text-gray-500">ViewBox & State</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-center">
                <div className="text-emerald-300 font-bold">generate</div>
                <div className="text-[9px] text-gray-500">Nemotron 120B</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-center">
                <div className="text-amber-300 font-bold">verify_code</div>
                <div className="text-[9px] text-gray-500">AST & Runtime</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-center">
                <div className="text-rose-300 font-bold">heal_code</div>
                <div className="text-[9px] text-gray-500">Self-Repair</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-center">
                <div className="text-teal-300 font-bold">export</div>
                <div className="text-[9px] text-gray-500">JSX & Preview</div>
              </div>
            </div>
          </div>

          {/* Section 3: Tech Stack & Deployment to Vercel */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
              Production Architecture & Vercel Deployment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="font-semibold text-white">Next.js 14 App Router</div>
                <p className="text-gray-400 text-[11px] mt-1">
                  Full-viewport cinematic streaming frontend with serverless API routes deployable with 1-click on Vercel.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="font-semibold text-white">GSAP 3 + Three.js WebGL</div>
                <p className="text-gray-400 text-[11px] mt-1">
                  60 FPS smooth physics animation loops and 3D architectural reconstructions with zero runtime lag.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="font-semibold text-white">OpenRouter Model Pool</div>
                <p className="text-gray-400 text-[11px] mt-1">
                  Nemotron 3 Super 120B, Gemini 2.0 Flash, and Claude 3.5 Sonnet with automated fallback and load balancing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
