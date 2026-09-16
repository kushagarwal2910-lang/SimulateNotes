"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  Radio,
  Play,
} from "lucide-react";

interface VoiceAssistantHUDProps {
  isVoiceActive: boolean;
  onClose: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  isMuted: boolean;
  isDemonstrating: boolean;
  lastSpokenText: string;
  userTranscript: string;
  onToggleListening: () => void;
  onToggleMute: () => void;
  onTriggerDemonstration: () => void;
  hasSimulation: boolean;
  simulationTitle?: string;
  isCompiling?: boolean;
}

export const VoiceAssistantHUD: React.FC<VoiceAssistantHUDProps> = ({
  isVoiceActive,
  onClose,
  isListening,
  isSpeaking,
  isThinking,
  isMuted,
  isDemonstrating,
  lastSpokenText,
  userTranscript,
  onToggleListening,
  onToggleMute,
  onTriggerDemonstration,
  hasSimulation,
  simulationTitle,
  isCompiling,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVoiceActive) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto select-none font-sans animate-fade-in">
      {/* Minimized Pill */}
      {isMinimized ? (
        <div
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-950 border border-neutral-800 shadow-2xl hover:border-neutral-600 cursor-pointer text-xs text-neutral-300 transition-colors"
        >
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-sky-400 animate-ping" : isListening ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"}`} />
            <Radio className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <span className="font-medium text-white">Voice Assistant</span>
          <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
        </div>
      ) : (
        /* Full Floating HUD Card */
        <div className="w-80 sm:w-96 rounded-2xl bg-neutral-950/95 backdrop-blur-md border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
          {/* Top Bar */}
          <div className="px-4 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? "bg-sky-400 animate-ping" : isListening ? "bg-emerald-400 animate-pulse" : "bg-sky-400"}`} />
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 absolute" />
              </div>
              <span className="text-xs font-semibold text-white tracking-tight uppercase font-mono">
                AI Voice Tutor
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                title="Minimize HUD"
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                title="Close Voice Assistant"
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Status & Animated Waveform */}
          <div className="p-4 space-y-3">
            {/* Status Label */}
            <div className="flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-neutral-400">
                {isThinking ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>Analyzing RAG context...</span>
                  </span>
                ) : isSpeaking ? (
                  <span className="text-sky-400 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    <span>Speaking to you...</span>
                  </span>
                ) : isListening ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Mic className="w-3 h-3 animate-pulse" />
                    <span>Listening for your voice...</span>
                  </span>
                ) : isDemonstrating ? (
                  <span className="text-purple-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3 animate-bounce" />
                    <span>Controlling simulation parameters!</span>
                  </span>
                ) : isCompiling ? (
                  <span className="text-sky-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Dual LangGraph compiling 60 FPS model...</span>
                  </span>
                ) : (
                  <span>Ready • Speak or ask anything</span>
                )}
              </div>

              {hasSimulation && (
                <span className="text-neutral-500 text-[10px] truncate max-w-[110px]">
                  {simulationTitle || "Simulation"}
                </span>
              )}
            </div>

            {/* Dynamic Sound Waveform Bars */}
            <div className="h-10 w-full bg-neutral-900/60 rounded-xl border border-neutral-800/80 px-4 flex items-center justify-center gap-1.5 overflow-hidden">
              {[40, 65, 30, 90, 50, 75, 20, 85, 45, 60, 95, 35, 70, 50, 80].map((h, i) => {
                const isActive = isSpeaking || isListening || isDemonstrating;
                const animDuration = `${0.4 + (i % 5) * 0.15}s`;
                return (
                  <span
                    key={i}
                    style={{
                      height: isActive ? `${Math.max(15, (h * (isSpeaking ? 1 : 0.7)))}%` : "15%",
                      transition: "height 0.15s ease",
                      animationDuration: animDuration,
                    }}
                    className={`w-1 rounded-full ${
                      isSpeaking
                        ? "bg-sky-400 animate-pulse"
                        : isListening
                        ? "bg-emerald-400 animate-pulse"
                        : isDemonstrating
                        ? "bg-purple-400 animate-pulse"
                        : "bg-neutral-700"
                    }`}
                  />
                );
              })}
            </div>

            {/* Subtitles / Speech Bubble */}
            {(lastSpokenText || userTranscript) && (
              <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800/90 text-xs leading-relaxed max-h-24 overflow-y-auto">
                {userTranscript ? (
                  <p className="text-emerald-300 font-mono text-[11px]">
                    <span className="text-neutral-500 font-sans">You: </span>
                    &ldquo;{userTranscript}&rdquo;
                  </p>
                ) : (
                  <p className="text-neutral-200">
                    <span className="text-sky-400 font-mono text-[10px] font-semibold block mb-0.5">
                      ASSISTANT SPEECH:
                    </span>
                    {lastSpokenText}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="px-4 py-3 bg-neutral-900/40 border-t border-neutral-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {/* Mic Toggle Button */}
              <button
                onClick={onToggleListening}
                title={isListening ? "Mute Microphone" : "Speak to Assistant"}
                className={`p-2 rounded-full border transition-all ${
                  isListening
                    ? "bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                    : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500"
                }`}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              {/* Speaker Mute Toggle */}
              <button
                onClick={onToggleMute}
                title={isMuted ? "Unmute Assistant Voice" : "Mute Voice"}
                className={`p-2 rounded-full border transition-all ${
                  isMuted
                    ? "bg-neutral-800 border-neutral-700 text-neutral-500"
                    : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500"
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Interactive Demonstration Trigger Button */}
            {hasSimulation && !isCompiling && (
              <button
                onClick={onTriggerDemonstration}
                disabled={isDemonstrating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-medium text-xs shadow-md transition-all disabled:opacity-50"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isDemonstrating ? "Demonstrating..." : "Walkthrough Controls"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
