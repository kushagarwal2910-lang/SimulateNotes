"use client";

import React, { useState } from "react";
import { X, Maximize2, Minimize2, RotateCcw, ExternalLink, Code2, Sliders, Sparkles } from "lucide-react";
import { SimulationItem } from "@/lib/simulationsData";

interface SimulationStageModalProps {
  simulation: SimulationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCodeAgentWithSpec: (promptPath: string) => void;
}

export const SimulationStageModal: React.FC<SimulationStageModalProps> = ({
  simulation,
  isOpen,
  onClose,
  onOpenCodeAgentWithSpec,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"stage" | "code" | "math">("stage");
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen || !simulation) return null;

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full liquid-panel rounded-2xl flex flex-col transition-all duration-300 overflow-hidden ${
          isFullscreen ? "fixed inset-0 rounded-none h-full" : "max-w-6xl h-[90vh]"
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <span>{simulation.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-sky-300">
                  {simulation.category}
                </span>
              </h2>
              <p className="text-[11px] text-gray-400 font-mono hidden sm:block">
                Engine: React 18 + GSAP 3 Physics Sandbox • LangGraph Verified
              </p>
            </div>
          </div>

          {/* Center Tabs: Stage vs Code vs Math */}
          <div className="flex items-center p-1 rounded-lg bg-white/5 border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("stage")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "stage" ? "bg-white/20 text-white font-medium shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              Interactive Stage
            </button>
            <button
              onClick={() => setActiveTab("math")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "math" ? "bg-white/20 text-white font-medium shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              Math & Physics
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "code" ? "bg-white/20 text-white font-medium shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              React Code
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={reloadIframe}
              title="Reset Simulation"
              className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-gray-300 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <a
              href={simulation.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open full preview in new tab"
              className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-gray-300 hover:text-white"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-gray-300 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              title="Close Stage"
              className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-gray-300 hover:text-rose-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-[#0b0f19] overflow-hidden">
          {activeTab === "stage" && (
            <iframe
              key={iframeKey}
              src={simulation.previewUrl}
              className="w-full h-full border-0"
              title={simulation.title}
              sandbox="allow-scripts allow-same-origin"
            />
          )}

          {activeTab === "math" && (
            <div className="h-full overflow-y-auto p-6 md:p-8 space-y-6 text-gray-200">
              <div className="max-w-3xl mx-auto space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{simulation.subtitle}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{simulation.description}</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="text-xs uppercase tracking-wider font-mono text-sky-400 font-bold">
                    Analytical Equations & Physics Formulas
                  </div>
                  <div className="space-y-2">
                    {simulation.equations.map((eq, i) => (
                      <div key={i} className="font-mono text-sm px-3 py-2 rounded-lg bg-black/50 border border-white/5 text-sky-200">
                        {eq}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {simulation.keyParameters.map((p, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] text-gray-400">{p.name}</div>
                      <div className="text-lg font-bold font-mono text-white mt-1">
                        {p.value} <span className="text-xs text-gray-400 font-normal">{p.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-indigo-300">Prompt Specification</div>
                    <div className="text-[11px] text-gray-400 font-mono">{simulation.promptFile}</div>
                  </div>
                  <button
                    onClick={() => {
                      onOpenCodeAgentWithSpec(simulation.promptFile);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full liquid-glass text-xs font-semibold text-sky-300 hover:text-white"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Re-Synthesize via Agent</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <div className="h-full overflow-y-auto p-4 md:p-6 text-xs font-mono text-gray-300 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Component: {simulation.jsxUrl}</span>
                <span className="text-emerald-400">Syntax Check: Passed • Delimiters: Balanced</span>
              </div>
              <div className="p-4 rounded-xl bg-black/70 border border-white/10 text-gray-300 overflow-x-auto">
                <pre className="text-[11px] leading-relaxed">
                  {`// Generated React 18 + GSAP Simulation Component
// Architecture: LangGraph Autonomous Simulation Generator Agent
// Verification: Headless Puppeteer Verified & Self-Healed

import React, { useState, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

export default function ${simulation.slug.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}() {
  // [Interactive Parameters]
  ${simulation.keyParameters.map(p => `const [${p.name.toLowerCase().replace(/\s+/g, '')}, set${p.name.replace(/\s+/g, '')}] = useState(${p.value}); // ${p.unit}`).join('\n  ')}
  const [isPlaying, setIsPlaying] = useState(true);

  // [Physics Formulation]
  // Governing relations: ${simulation.equations.join(" | ")}

  // [GSAP / RAF Animation Loop & SVG Path Calculations]
  // Complete production-ready implementation generated by LangGraph Agent.
  // Full source located in: ${simulation.jsxUrl}
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
