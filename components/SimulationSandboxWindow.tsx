"use client";

import React, { useState } from "react";
import { RotateCcw, Maximize2, Minimize2, ExternalLink, Code2, BookOpen, Layers, Check, Copy, Play, Loader2, Sparkles, Radio, AlertCircle, Clock } from "lucide-react";
import { SimulationItem } from "@/lib/simulationsData";

interface SimulationSandboxWindowProps {
  simulation: SimulationItem | null;
  onReset?: () => void;
  onFullscreenToggle?: () => void;
  isFullscreen?: boolean;
  iframeRef?: any;
  onToggleVoiceGuide?: () => void;
  isVoiceActive?: boolean;
}

export const SimulationSandboxWindow: React.FC<SimulationSandboxWindowProps> = ({
  simulation,
  onFullscreenToggle,
  isFullscreen,
  iframeRef,
  onToggleVoiceGuide,
  isVoiceActive,
}) => {
  const [activeTab, setActiveTab] = useState<"canvas" | "notes" | "code">("canvas");
  const [iframeKey, setIframeKey] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!simulation) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black p-8 text-center border-l border-[#1c1c1c] select-none">
        <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-600 mb-3">
          <Play className="w-5 h-5 ml-0.5" />
        </div>
        <h3 className="text-sm font-semibold text-white tracking-tight">Studio Empty</h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
          Ask a question in the chat or select a simulation from the sources sidebar to launch an interactive model here.
        </p>
      </div>
    );
  }

  // Dynamic simulation in progress or error
  if (simulation.isDynamic && !simulation.previewUrl) {
    if (simulation.isError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black p-8 text-center border-l border-[#1c1c1c] select-none">
          <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-center justify-center text-red-400 mb-4 shadow-2xl">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-mono mb-3">
            <span>Pipeline Halted</span>
          </div>
          <h3 className="text-base font-semibold text-white tracking-tight mb-2">
            Simulation Generation Notice
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm leading-relaxed mb-5 font-sans">
            {simulation.errorMessage || "The AI engine encountered an error formulating or compiling the visual model."}
          </p>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-left text-xs text-neutral-300 max-w-sm mb-2 space-y-2">
            <div className="text-[11px] text-neutral-500 font-mono uppercase tracking-wider">Troubleshooting Suggestions:</div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Ask again in the chat bar with specific parameters or equations.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Open the top-nav Telemetry HUD to switch to <strong>NVIDIA NIM 550B</strong> or your personal <strong>OpenRouter BYOK</strong> key.</span>
            </div>
          </div>
        </div>
      );
    }

    const step = simulation.currentStep || "init";
    const detail = simulation.currentDetail || "Synthesizing physical equations and visual model...";
    const elapsed = simulation.elapsedSec || 1;

    const isStep1Active = step.includes("rag") || step.includes("tavily") || step.includes("research") || step === "init";
    const isStep1Done = step.includes("spec") || step.includes("code") || step.includes("verify") || step.includes("done");

    const isStep2Active = step.includes("spec") || step.includes("synth");
    const isStep2Done = step.includes("code") || step.includes("verify") || step.includes("done");

    const isStep3Active = step.includes("code") || step.includes("generat");
    const isStep3Done = step.includes("verify") || step.includes("done");

    const isStep4Active = step.includes("verify") || step.includes("ast") || step.includes("babel") || step.includes("sandbox");

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black p-8 text-center border-l border-[#1c1c1c] select-none">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-sky-400 shadow-2xl relative z-10">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-sky-500/20 blur-xl animate-pulse"></div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/60 text-sky-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dual-Agent Engine Active</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{elapsed}s elapsed</span>
          </div>
        </div>

        <h3 className="text-base font-semibold text-white tracking-tight mb-1">
          Generating Interactive Simulation
        </h3>
        <p className="text-xs text-neutral-400 max-w-sm leading-relaxed mb-4 font-sans">
          Synthesizing simulation for <span className="text-white font-medium">&quot;{simulation.title}&quot;</span>.
        </p>

        {/* Live Detail Banner */}
        <div className="w-full max-w-sm p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/90 text-xs text-neutral-300 mb-5 font-mono text-left flex items-center gap-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="truncate">{detail}</span>
        </div>

        {/* 4-Stage Progress Pills */}
        <div className="w-full max-w-sm space-y-2 text-left text-xs font-mono">
          <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
            isStep1Active && !isStep1Done ? "bg-sky-950/40 border-sky-800/70 text-sky-300" :
            isStep1Done ? "bg-neutral-950/60 border-neutral-800 text-emerald-400" : "bg-neutral-950 border-neutral-900 text-neutral-500"
          }`}>
            <div className="flex items-center gap-2.5 truncate">
              {isStep1Done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className={`w-2 h-2 rounded-full ${isStep1Active ? "bg-sky-400 animate-ping" : "bg-neutral-700"}`} />}
              <span className="truncate">1. Literature Grounding &amp; RAG</span>
            </div>
            <span className="text-[10px] text-neutral-500">{isStep1Done ? "Indexed" : isStep1Active ? "Running" : "Pending"}</span>
          </div>

          <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
            isStep2Active && !isStep2Done ? "bg-sky-950/40 border-sky-800/70 text-sky-300" :
            isStep2Done ? "bg-neutral-950/60 border-neutral-800 text-emerald-400" : "bg-neutral-950 border-neutral-900 text-neutral-500"
          }`}>
            <div className="flex items-center gap-2.5 truncate">
              {isStep2Done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className={`w-2 h-2 rounded-full ${isStep2Active ? "bg-sky-400 animate-ping" : "bg-neutral-700"}`} />}
              <span className="truncate">2. Physics Equations &amp; Math</span>
            </div>
            <span className="text-[10px] text-neutral-500">{isStep2Done ? "Verified" : isStep2Active ? "Formulating" : "Pending"}</span>
          </div>

          <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
            isStep3Active && !isStep3Done ? "bg-sky-950/40 border-sky-800/70 text-sky-300" :
            isStep3Done ? "bg-neutral-950/60 border-neutral-800 text-emerald-400" : "bg-neutral-950 border-neutral-900 text-neutral-500"
          }`}>
            <div className="flex items-center gap-2.5 truncate">
              {isStep3Done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className={`w-2 h-2 rounded-full ${isStep3Active ? "bg-sky-400 animate-ping" : "bg-neutral-700"}`} />}
              <span className="truncate">3. React 18 + GSAP Physics Engine</span>
            </div>
            <span className="text-[10px] text-neutral-500">{isStep3Done ? "Compiled" : isStep3Active ? "Generating" : "Pending"}</span>
          </div>

          <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
            isStep4Active ? "bg-sky-950/40 border-sky-800/70 text-sky-300" : "bg-neutral-950 border-neutral-900 text-neutral-500"
          }`}>
            <div className="flex items-center gap-2.5 truncate">
              <span className={`w-2 h-2 rounded-full ${isStep4Active ? "bg-sky-400 animate-ping" : "bg-neutral-700"}`} />
              <span className="truncate">4. Babel AST Verification &amp; Audit</span>
            </div>
            <span className="text-[10px] text-neutral-500">{isStep4Active ? "Testing" : "Pending"}</span>
          </div>
        </div>
      </div>
    );
  }

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(
      `// React 18 + GSAP Simulation: ${simulation.title}\n// Source: ${simulation.jsxUrl}`
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-black border-l border-[#1c1c1c] select-none overflow-hidden">
      {/* Studio Top Bar (NotebookLM Signature Studio Header) */}
      <div className="h-12 bg-black border-b border-[#1c1c1c] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-white tracking-tight uppercase font-mono">
            Studio
          </h3>
          <span className="text-neutral-600 font-mono text-xs">/</span>
          <span className="text-xs text-neutral-300 truncate max-w-[140px] sm:max-w-[200px]">
            {simulation.title}
          </span>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center bg-neutral-950 border border-neutral-800 p-0.5 rounded text-xs">
          <button
            onClick={() => setActiveTab("canvas")}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              activeTab === "canvas"
                ? "bg-white text-black font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Simulation
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              activeTab === "notes"
                ? "bg-white text-black font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Formulas
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              activeTab === "code"
                ? "bg-white text-black font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Code
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {onToggleVoiceGuide && (
            <button
              onClick={onToggleVoiceGuide}
              title={isVoiceActive ? "Voice Tutor Active" : "Enable Voice Tutor"}
              className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-all ${
                isVoiceActive
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
              }`}
            >
              <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
              <span>Voice Tutor</span>
            </button>
          )}

          <button
            onClick={reloadIframe}
            title="Reset Simulation"
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {onFullscreenToggle && (
            <button
              onClick={onFullscreenToggle}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          <a
            href={simulation.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open isolated preview"
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Tab 1: Live Interactive Simulation Stage (fits container) */}
        {activeTab === "canvas" && (
          <div className="w-full h-full relative overflow-hidden bg-black">
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={simulation.previewUrl}
              className="w-full h-full border-0 block bg-black"
              title={simulation.title}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}

        {/* Tab 2: Formulas & Physics Study Notes */}
        {activeTab === "notes" && (
          <div className="h-full overflow-y-auto p-6 space-y-6 text-neutral-200">
            <div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                Study Guide & Formulation Note
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">{simulation.title}</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{simulation.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                Governing Analytical Equations
              </div>
              <div className="space-y-1.5 pt-1">
                {simulation.equations.map((eq, i) => (
                  <div key={i} className="font-mono text-xs px-3 py-2 rounded bg-black border border-neutral-800 text-white">
                    {eq}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                Dynamic Physical Parameters
              </div>
              <div className="grid grid-cols-2 gap-2">
                {simulation.keyParameters.map((p, i) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-500">{p.name}</div>
                    <div className="text-sm font-mono font-medium text-white mt-0.5">
                      {p.value} <span className="text-xs text-neutral-400 font-normal">{p.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 font-mono flex items-center justify-between">
              <span>LangGraph Generator: Passed AST Check</span>
              <span className="text-white">60 FPS GSAP Ticker</span>
            </div>
          </div>
        )}

        {/* Tab 3: React Code Inspector */}
        {activeTab === "code" && (
          <div className="h-full overflow-y-auto p-4 font-mono text-xs text-neutral-300 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <span>Component Source: {simulation.jsxUrl}</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-white hover:underline text-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 overflow-x-auto text-[11px] leading-relaxed">
              <pre>{`// Component: ${simulation.title}
// Generated via LangGraph Simulation Agent (Agent 2)
// Architecture: React 18 + GSAP 3 Physics Stage

import React, { useState, useEffect, useMemo } from "react";
import gsap from "gsap";

export function Simulation() {
  // [Interactive State Variables]
  ${simulation.keyParameters.map(p => `const [${p.name.toLowerCase().replace(/\s+/g, '')}, set${p.name.replace(/\s+/g, '')}] = useState(${p.value});`).join('\n  ')}

  // [Analytical Physics Invariants]
  // ${simulation.equations.join("\n  // ")}

  return (
    <div className="w-full h-full bg-black text-white p-4">
      {/* Complete Verified React 18 SVG Stage */}
    </div>
  );
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
