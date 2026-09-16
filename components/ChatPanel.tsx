"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Play, Loader2, ArrowRight, Sparkles, MessageSquare } from "lucide-react";
import { ChatMessage } from "@/lib/notebookTypes";
import { SimulationItem } from "@/lib/simulationsData";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isProcessing: boolean;
  activeProcessingAgent: "agent1" | "agent2" | null;
  onRunSimulation: (simulation: SimulationItem) => void;
  onCitationClick: (sourceIndex: number) => void;
  activeSourceCount: number;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  activeProcessingAgent,
  onRunSimulation,
  onCitationClick,
  activeSourceCount,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Explain Bayes' Theorem and simulate posterior probability updates.",
    "How does quantum tunneling probability decay with barrier thickness?",
    "Explain how angular momentum and vis-viva velocity dictate orbits.",
    "Simulate Li+ ion intercalation across electrolyte under Butler-Volmer kinetics.",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-black select-none overflow-hidden relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty / Welcoming State (NotebookLM Style) */
          <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-8 py-16">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 mx-auto flex items-center justify-center text-white mb-4">
                <MessageSquare className="w-5 h-5 text-neutral-300" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-white">
                {activeSourceCount > 0
                  ? "Start asking questions about your sources"
                  : "Add sources to start researching"}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                {activeSourceCount > 0
                  ? `SimulateNotes searches your ${activeSourceCount} indexed sources to answer questions and triggers the dual LangGraph agents to generate interactive simulations in the Studio.`
                  : "Click '+ Add source' in the left sidebar to index scientific papers or web documents via Tavily. Once indexed, you can ask questions and generate interactive simulations grounded in your sources."}
              </p>
            </div>

            {/* Suggested Question Chips (NotebookLM Style) */}
            {activeSourceCount > 0 ? (
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 w-full max-w-lg">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(q)}
                    className="px-3.5 py-2 rounded-full bg-neutral-950 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900 text-xs text-neutral-300 text-left transition-colors flex items-center gap-1.5"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-500 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-400 max-w-md">
                <span className="font-mono text-sky-400">Step 1:</span> Click <span className="text-white font-medium">+ Add source</span> in the left panel to fetch authoritative literature.
              </div>
            )}
          </div>
        ) : (
          /* Chat Conversation Thread */
          <div className="max-w-2xl mx-auto space-y-6 pb-20">
            {messages.map((msg) => {
              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-lg p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm">
                      <p className="leading-relaxed font-normal">{msg.content}</p>
                      <span className="block text-[10px] text-neutral-500 text-right mt-1 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              }

              if (msg.role === "agent_rag") {
                return (
                  <div key={msg.id} className="text-left space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                      <span>SIMULATENOTES RAG // SOURCES GROUNDED</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs sm:text-sm text-neutral-200 leading-relaxed space-y-3 whitespace-pre-line">
                      {msg.content}

                      {/* In-Line Grounded Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2 border-t border-neutral-800/60 flex items-center flex-wrap gap-1.5 text-[11px]">
                          <span className="text-neutral-500 text-[10px] font-mono">Grounded sources:</span>
                          {msg.citations.map((cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => onCitationClick(cIdx - 1)}
                              className="px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-700 hover:bg-white hover:text-black font-mono text-[10px] transition-colors"
                              title="Inspect source details in left panel"
                            >
                              [{cIdx}]
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              if (msg.role === "agent_simulation" && msg.simulation) {
                const sim = msg.simulation;
                return (
                  <div key={msg.id} className="text-left space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                      <span>SIMULATION GENERATED // AGENT 2</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-700 text-xs sm:text-sm text-neutral-200 space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white tracking-tight">{sim.title}</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">{sim.description}</p>
                      </div>

                      {/* Equations Snapshot */}
                      <div className="p-2.5 rounded bg-black border border-neutral-800 space-y-1">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                          Governing Physics Relations:
                        </span>
                        <div className="font-mono text-xs text-neutral-300">
                          {sim.equations.slice(0, 2).join("  |  ")}
                        </div>
                      </div>

                      {/* Action: Open in Right Studio */}
                      <div className="pt-2 flex items-center justify-between border-t border-neutral-800/80">
                        <span className="text-[11px] text-neutral-500 font-mono">
                          React 18 + GSAP Verified
                        </span>
                        <button
                          onClick={() => onRunSimulation(sim)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black font-medium text-xs transition-colors"
                        >
                          <Play className="w-3 h-3 fill-black" />
                          <span>Open in Studio</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {/* Processing State */}
            {isProcessing && (
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>
                  {activeProcessingAgent === "agent1"
                    ? "Agent 1 crawling Tavily and indexing RAG database..."
                    : "Agent 2 compiling interactive simulation into Studio..."}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Pill Input Bar (NotebookLM Signature Style) */}
      <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-center pointer-events-none">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-600 focus-within:border-white rounded-full p-1.5 pl-5 pr-2 flex items-center gap-2 shadow-2xl pointer-events-auto transition-colors"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              activeSourceCount === 0
                ? "Click '+ Add source' on the left first to index literature..."
                : "Ask a question about your sources or request a simulation..."
            }
            className="flex-1 bg-transparent text-white placeholder:text-neutral-500 text-xs sm:text-sm focus:outline-none font-sans"
          />

          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="w-8 h-8 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-white shrink-0"
            title="Submit query"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <ArrowUp className="w-4 h-4 text-black" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
