"use client";

import React, { useState, useEffect, useRef } from "react";
import { SimulateNotesDashboard } from "@/components/SimulateNotesDashboard";
import { SimulateNotesHeader } from "@/components/SimulateNotesHeader";
import { SourcesSidebar } from "@/components/SourcesSidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { SimulationSandboxWindow } from "@/components/SimulationSandboxWindow";
import { AddSourceModal } from "@/components/AddSourceModal";
import { SourceReaderModal } from "@/components/SourceReaderModal";
import { VoiceAssistantHUD } from "@/components/VoiceAssistantHUD";
import { useVoiceAssistant } from "@/lib/useVoiceAssistant";
import { PRESET_SIMULATENOTES, SimulateNote } from "@/lib/simulateNotesData";
import { SourceDocument, ChatMessage } from "@/lib/simulateNotesTypes";
import { SIMULATIONS_CATALOG, SimulationItem } from "@/lib/simulationsData";

export default function App() {
  // Multi-Note State
  const [notebooks, setNotebooks] = useState<SimulateNote[]>(PRESET_SIMULATENOTES);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);

  // Active Note Workspace State
  const activeNotebook = notebooks.find((nb) => nb.id === activeNotebookId) || null;

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [readingSource, setReadingSource] = useState<SourceDocument | null>(null);
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(new Set());
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeProcessingAgent, setActiveProcessingAgent] = useState<"agent1" | "agent2" | null>(null);

  // Studio iframe ref for programmatic voice control
  const studioIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Load notes from localStorage for instant 0ms load, then sync with /api/notes
  useEffect(() => {
    const loadNotes = async () => {
      // 1. Instant local cache restore
      try {
        const cached = localStorage.getItem("simulatenotes_user_notes");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotebooks((prev) => {
              const currentIds = new Set(prev.map((n) => n.id));
              const newCustom = parsed.filter((n: any) => !currentIds.has(n.id));
              return [...newCustom, ...prev];
            });
          }
        }
      } catch {}

      // 2. Fetch server notes
      try {
        const res = await fetch("/api/notes");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.notes) && data.notes.length > 0) {
            setNotebooks(data.notes);
          }
        }
      } catch (err) {
        console.error("Failed to load notes from /api/notes:", err);
      }
    };
    loadNotes();
  }, []);

  // Helper to persist note changes to server and local storage
  const saveNoteToDisk = async (note: SimulateNote) => {
    try {
      try {
        const cached = localStorage.getItem("simulatenotes_user_notes");
        const list: SimulateNote[] = cached ? JSON.parse(cached) : [];
        const filtered = list.filter((n) => n.id !== note.id);
        localStorage.setItem("simulatenotes_user_notes", JSON.stringify([note, ...filtered]));
      } catch {}

      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
    } catch (err) {
      console.error("Failed to save note to disk:", err);
    }
  };

  // Delete note permanently from state, localStorage, and server
  const handleDeleteNotebook = async (notebookId: string) => {
    setNotebooks((prev) => prev.filter((nb) => nb.id !== notebookId));
    if (activeNotebookId === notebookId) {
      setActiveNotebookId(null);
    }
    try {
      const cached = localStorage.getItem("simulatenotes_user_notes");
      if (cached) {
        const list: SimulateNote[] = JSON.parse(cached);
        localStorage.setItem("simulatenotes_user_notes", JSON.stringify(list.filter((n) => n.id !== notebookId)));
      }
    } catch {}

    try {
      await fetch(`/api/notes?id=${notebookId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  // Real-time Voice Assistant Hook with simulation control capabilities
  const voiceAssistant = useVoiceAssistant({
    notebookId: activeNotebook?.id,
    notebookTitle: activeNotebook?.title,
    sources: activeNotebook?.sources,
    simulation: activeNotebook?.simulation,
    iframeRef: studioIframeRef,
  });

  // Select and open a note from dashboard
  const handleSelectNotebook = (notebookId: string) => {
    const found = notebooks.find((nb) => nb.id === notebookId);
    if (found) {
      setActiveNotebookId(notebookId);
      setSelectedSourceIds(new Set(found.sources.map((s) => s.id)));
      if (found.sources[0]) setActiveSourceId(found.sources[0].id);
      setIsStudioOpen(Boolean(found.simulation));
    }
  };

  // Create a brand new SimulateNote
  const handleCreateNewNotebook = () => {
    const newId = `sn-${Date.now()}`;
    const newNb: SimulateNote = {
      id: newId,
      title: "Untitled Note",
      description: "Ask questions, crawl Tavily sources, and generate live interactive simulations.",
      date: "Just now",
      sources: [],
      simulation: null,
      messages: [],
    };
    setNotebooks((prev) => [newNb, ...prev]);
    setActiveNotebookId(newId);
    setSelectedSourceIds(new Set());
    setActiveSourceId(null);
    setIsStudioOpen(false); // Studio closed until a simulation is requested
    setIsAddSourceModalOpen(false); // Clean empty state, ready for chat input
    saveNoteToDisk(newNb);
  };

  // Toggle single source selection
  const handleToggleSelectSource = (sourceId: string) => {
    setSelectedSourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  };

  // Select all sources
  const handleSelectAllSources = (selectAll: boolean) => {
    if (!activeNotebook) return;
    if (selectAll) {
      setSelectedSourceIds(new Set(activeNotebook.sources.map((s) => s.id)));
    } else {
      setSelectedSourceIds(new Set());
    }
  };

  // Add sources to current notebook (without triggering simulation)
  const handleAddSources = (newSources: SourceDocument[], topicTitle: string) => {
    if (!activeNotebook) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const existingIds = new Set(activeNotebook.sources.map((s) => s.id));
    const filteredNew = newSources.filter((s) => !existingIds.has(s.id));
    const updatedSources = [...filteredNew, ...activeNotebook.sources];

    // Select new sources
    setSelectedSourceIds((prev) => {
      const next = new Set(prev);
      filteredNew.forEach((s) => next.add(s.id));
      return next;
    });

    if (filteredNew[0]) {
      setActiveSourceId(filteredNew[0].id);
    }

    // Confirmation message in chat indicating RAG database is ready
    const ragReadyMsg: ChatMessage = {
      id: `agent1-indexed-${Date.now()}`,
      role: "agent_rag",
      timestamp,
      content: `📚 **Indexed ${newSources.length} sources on "${topicTitle}" into this notebook's RAG database.**\n\nYour research knowledge base is ready and intact. Ask any question or request a 60 FPS interactive simulation in the chat bar below!`,
      citations: newSources.map((_, i) => i + 1),
    };

    setNotebooks((prev) =>
      prev.map((nb) => {
        if (nb.id !== activeNotebook.id) return nb;
        const isUntitled =
          nb.title === "Untitled Note" ||
          nb.title === "Untitled Notebook" ||
          nb.title.startsWith("Untitled");
        const updatedNb = {
          ...nb,
          title: isUntitled ? topicTitle : nb.title,
          sources: updatedSources,
          messages: [...nb.messages, ragReadyMsg],
        };
        saveNoteToDisk(updatedNb);
        return updatedNb;
      })
    );
    // Note: Studio remains closed/untouched until user queries a simulation from the chat!
  };

  // Send message in current notebook (queries existing RAG database & generates simulation)
  const handleSendMessage = async (query: string) => {
    if (!activeNotebook) return;

    // Dismiss any open modals
    setIsAddSourceModalOpen(false);
    setReadingSource(null);

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Append user message to active notebook and persist
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      timestamp,
      content: query,
    };

    setNotebooks((prev) =>
      prev.map((nb) => {
        if (nb.id !== activeNotebook.id) return nb;
        const updated = { ...nb, messages: [...nb.messages, userMsg] };
        saveNoteToDisk(updated);
        return updated;
      })
    );

    // 2. Begin RAG retrieval and LangGraph simulation compilation
    setIsProcessing(true);
    setActiveProcessingAgent("agent1");

    // Activate voice assistant and engage user while RAG retrieval & LangGraph compilation run
    voiceAssistant.setIsVoiceActive(true);
    voiceAssistant.askAssistant(query, "compiling");

    try {
      // Step A: Call RAG Agent querying over already-indexed sources
      const res = await fetch("/api/rag-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId: activeNotebook.id,
          query,
          selectedSourceIds: Array.from(selectedSourceIds),
          existingSources: activeNotebook.sources,
        }),
      });

      const data = await res.json();
      const isDynamic = Boolean(data.dynamicGeneration);
      const dynamicJobId = data.generationJobId;

      let currentSim: SimulationItem | null = data.simulation;
      if (!currentSim && isDynamic) {
        currentSim = {
          id: `dyn_${Date.now()}`,
          slug: `dynamic_${Date.now()}`,
          title: query.length > 45 ? query.slice(0, 45) + "..." : query,
          subtitle: "LangGraph Generating Interactive Simulation...",
          category: "Dynamic Simulation",
          rating: "AI Generated",
          duration: "Interactive",
          date: "Just now",
          description: `Generating 60 FPS interactive visual simulation for: ${query}`,
          previewUrl: "",
          jsxUrl: "",
          promptFile: "",
          equations: [],
          keyParameters: [],
          accentColor: "#38bdf8",
          isDynamic: true,
        };
      } else if (!currentSim) {
        currentSim = activeNotebook.simulation;
      }

      const ragMsg: ChatMessage = {
        id: `agent1-${Date.now()}`,
        role: "agent_rag",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: data.answer || "Analyzed technical sources from your RAG knowledge base.",
        citations: [1, 2, 3],
      };

      setNotebooks((prev) =>
        prev.map((nb) => {
          if (nb.id !== activeNotebook.id) return nb;
          const updated = {
            ...nb,
            simulation: currentSim,
            messages: [...nb.messages, ragMsg],
          };
          saveNoteToDisk(updated);
          return updated;
        })
      );

      // Step B: Trigger Agent 2 (Simulation Generator)
      setActiveProcessingAgent("agent2");

      if (!isDynamic && currentSim) {
        await new Promise((r) => setTimeout(r, 600));

        const simMsg: ChatMessage = {
          id: `agent2-${Date.now()}`,
          role: "agent_simulation",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          content: `I've synthesized and AST-verified the React 18 + GSAP simulation for **${currentSim.title}**.`,
          simulation: currentSim,
        };

        setNotebooks((prev) =>
          prev.map((nb) => {
            if (nb.id !== activeNotebook.id) return nb;
            const updated = { ...nb, simulation: currentSim, messages: [...nb.messages, simMsg] };
            saveNoteToDisk(updated);
            return updated;
          })
        );

        if (!isStudioOpen) setIsStudioOpen(true);

        // Voice Assistant demonstrates the matched simulation
        setTimeout(() => {
          voiceAssistant.askAssistant(
            `Let's explore ${currentSim?.title || "this simulation"}. Demonstrate the controls and explain the physics.`,
            "demonstrate"
          );
        }, 1000);
      } else if (isDynamic && currentSim) {
        if (currentSim.previewUrl) {
          // Simulation was generated immediately during the request
          const readyMsg: ChatMessage = {
            id: `agent2-ready-${Date.now()}`,
            role: "agent_simulation",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            content: `🎉 Successfully generated, AST-verified, and compiled the interactive simulation for **${currentSim.title}**! You can now interact with sliders and live parameters in the Studio.`,
            simulation: currentSim,
          };

          setNotebooks((prev) =>
            prev.map((nb) => {
              if (nb.id !== activeNotebook.id) return nb;
              const updatedNb = {
                ...nb,
                title: nb.title === "Untitled Notebook" || nb.title.includes("...") || nb.title === "Untitled Note" ? currentSim!.title : nb.title,
                simulation: currentSim,
                messages: [...nb.messages, readyMsg],
              };
              saveNoteToDisk(updatedNb);
              return updatedNb;
            })
          );

          if (!isStudioOpen) setIsStudioOpen(true);

          setTimeout(() => {
            voiceAssistant.askAssistant(
              `Simulation for ${currentSim!.title} compiled successfully. Walk me through the controls and demonstrate the physics.`,
              "demonstrate"
            );
          }, 1000);
        } else {
          // Simulation is compiling in the background, poll for status
          const simMsg: ChatMessage = {
            id: `agent2-${Date.now()}`,
            role: "agent_simulation",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            content: `I've dispatched your query and retrieved RAG context to the **LangGraph Dual-Agent pipeline**:\n\n• **Agent 1 (Spec Synthesizer)**: Formulating equations, state variables, and SVG blueprint into a dense JSON prompt\n• **Agent 2 (Simulation Engine)**: Compiling React 18 + GSAP code, running Babel AST check and self-healing\n\nTrack live compilation in the Studio panel on the right!`,
            simulation: currentSim,
          };

          setNotebooks((prev) =>
            prev.map((nb) => {
              if (nb.id !== activeNotebook.id) return nb;
              const updated = { ...nb, simulation: currentSim, messages: [...nb.messages, simMsg] };
              saveNoteToDisk(updated);
              return updated;
            })
          );

          if (!isStudioOpen) setIsStudioOpen(true);

          // Start polling for completion (1-second cadence for real-time progress)
          if (dynamicJobId) {
          const pollStartTime = Date.now();
          const pollInterval = setInterval(async () => {
            try {
              const pollRes = await fetch(`/api/generate-simulation/${dynamicJobId}`);
              if (!pollRes.ok) return;
              const pollData = await pollRes.json();
              const elapsedSec = Math.round((Date.now() - pollStartTime) / 1000);

              if (pollData.status === "completed" && pollData.simulation) {
                clearInterval(pollInterval);
                const readySim: SimulationItem = {
                  ...pollData.simulation,
                  isDynamic: true,
                  elapsedSec,
                  currentStep: "completed",
                  currentDetail: "Simulation compiled and verified!",
                };

                setNotebooks((prev) =>
                  prev.map((nb) => {
                    if (nb.id !== activeNotebook.id) return nb;

                    const readyMsg: ChatMessage = {
                      id: `agent2-ready-${Date.now()}`,
                      role: "agent_simulation",
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      content: `🎉 Successfully generated, AST-verified, and compiled the interactive simulation for **${readySim.title}** in ${elapsedSec}s! You can now interact with sliders and live parameters in the Studio.`,
                      simulation: readySim,
                    };

                    const updatedNb = {
                      ...nb,
                      title: nb.title === "Untitled Notebook" || nb.title.includes("...") || nb.title === "Untitled Note" ? readySim.title : nb.title,
                      simulation: readySim,
                      messages: [...nb.messages, readyMsg],
                    };
                    saveNoteToDisk(updatedNb);
                    return updatedNb;
                  })
                );

                // Voice assistant takes physical control of the compiled simulation
                setTimeout(() => {
                  voiceAssistant.askAssistant(
                    `Simulation for ${readySim.title} compiled successfully. Walk me through the controls and demonstrate the physics.`,
                    "demonstrate"
                  );
                }, 1200);
              } else if (pollData.status === "error" || pollData.status === "failed") {
                clearInterval(pollInterval);
                const errDetail = pollData.error || pollData.detail || "Pipeline failed";
                setNotebooks((prev) =>
                  prev.map((nb) => {
                    if (nb.id !== activeNotebook.id) return nb;
                    const errMsg: ChatMessage = {
                      id: `agent2-err-${Date.now()}`,
                      role: "agent_simulation",
                      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      content: `⚠️ Dynamic simulation generation notice: ${errDetail}`,
                    };
                    const updated = {
                      ...nb,
                      simulation: nb.simulation
                        ? {
                            ...nb.simulation,
                            isError: true,
                            errorMessage: errDetail,
                          }
                        : null,
                      messages: [...nb.messages, errMsg],
                    };
                    saveNoteToDisk(updated);
                    return updated;
                  })
                );
              } else {
                // Streaming progress update to Studio panel
                setNotebooks((prev) =>
                  prev.map((nb) => {
                    if (nb.id !== activeNotebook.id) return nb;
                    if (!nb.simulation) return nb;
                    return {
                      ...nb,
                      simulation: {
                        ...nb.simulation,
                        currentStep: pollData.step || "running",
                        currentDetail: pollData.detail || "Synthesizing physical equations and visual model...",
                        elapsedSec,
                      },
                    };
                  })
                );
              }
            } catch (pollErr) {
              console.error("Simulation polling error:", pollErr);
            }
          }, 1000);
        }
      }
    }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "agent_rag",
        timestamp,
        content: `Error during agent execution: ${err.message}`,
      };
      setNotebooks((prev) =>
        prev.map((nb) => {
          if (nb.id !== activeNotebook.id) return nb;
          const updated = { ...nb, messages: [...nb.messages, errorMsg] };
          saveNoteToDisk(updated);
          return updated;
        })
      );
    } finally {
      setIsProcessing(false);
      setActiveProcessingAgent(null);
    }
  };

  // Load simulation into Studio
  const handleLoadSimulation = (slug: string) => {
    const found = SIMULATIONS_CATALOG.find((s) => s.slug === slug);
    if (!found || !activeNotebook) return;

    setNotebooks((prev) =>
      prev.map((nb) => {
        if (nb.id === activeNotebook.id) {
          const updated = { ...nb, simulation: found };
          saveNoteToDisk(updated);
          return updated;
        }
        return nb;
      })
    );

    if (!isStudioOpen) setIsStudioOpen(true);

    if (voiceAssistant.isVoiceActive) {
      setTimeout(() => {
        voiceAssistant.askAssistant(
          `Loaded ${found.title}. Explain the principles and demonstrate the controls.`,
          "demonstrate"
        );
      }, 800);
    }
  };

  // ==========================================
  // VIEW 1: SIMULATENOTES HOME DASHBOARD
  // ==========================================
  if (!activeNotebookId || !activeNotebook) {
    return (
      <SimulateNotesDashboard
        notebooks={notebooks}
        onSelectNotebook={handleSelectNotebook}
        onCreateNewNotebook={handleCreateNewNotebook}
        onDeleteNotebook={handleDeleteNotebook}
      />
    );
  }

  // ==========================================
  // VIEW 2: SIMULATENOTES 3-COLUMN WORKSPACE
  // ==========================================
  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-black text-white overflow-hidden font-sans select-none z-10">
      {/* Top Header with Back Arrow to return to Home Page */}
      <SimulateNotesHeader
        currentTopic={activeNotebook.title}
        sourceCount={selectedSourceIds.size}
        isStudioOpen={isStudioOpen}
        onToggleStudio={() => setIsStudioOpen(!isStudioOpen)}
        onBackToDashboard={() => setActiveNotebookId(null)}
        onNewNotebook={handleCreateNewNotebook}
        onDeleteNotebook={() => handleDeleteNotebook(activeNotebook.id)}
        isAgent1Searching={isProcessing && activeProcessingAgent === "agent1"}
      />

      {/* Main 3-Column Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Column 1: Sources Panel (Left Navbar) */}
        <SourcesSidebar
          sources={activeNotebook.sources}
          activeSourceId={activeSourceId}
          selectedSourceIds={selectedSourceIds}
          onToggleSelectSource={handleToggleSelectSource}
          onSelectAllSources={handleSelectAllSources}
          onSelectSource={(source) => setActiveSourceId(source.id)}
          onViewSourceDetails={(source) => setReadingSource(source)}
          onOpenAddSourceModal={() => setIsAddSourceModalOpen(true)}
          isSearching={isProcessing && activeProcessingAgent === "agent1"}
          onLoadSimulation={handleLoadSimulation}
        />

        {/* Column 2: Chat Panel (Center Stage) */}
        <ChatPanel
          messages={activeNotebook.messages}
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
          activeProcessingAgent={activeProcessingAgent}
          onRunSimulation={(sim) => {
            handleLoadSimulation(sim.slug);
          }}
          onCitationClick={(idx) => {
            if (activeNotebook.sources[idx]) {
              setReadingSource(activeNotebook.sources[idx]);
            }
          }}
          activeSourceCount={selectedSourceIds.size}
        />

        {/* Column 3: Studio Panel (Right Panel - Simulation Sandbox & Notes) */}
        {isStudioOpen && (
          <div className="w-full sm:w-[440px] md:w-[480px] lg:w-[520px] xl:w-[560px] h-full shrink-0 flex flex-col overflow-hidden">
            <SimulationSandboxWindow
              simulation={activeNotebook.simulation}
              isFullscreen={false}
              onFullscreenToggle={() => {}}
              iframeRef={studioIframeRef}
              onToggleVoiceGuide={() => voiceAssistant.setIsVoiceActive(!voiceAssistant.isVoiceActive)}
              isVoiceActive={voiceAssistant.isVoiceActive}
            />
          </div>
        )}
      </div>

      {/* Add Source Modal */}
      <AddSourceModal
        isOpen={isAddSourceModalOpen}
        onClose={() => setIsAddSourceModalOpen(false)}
        notebookId={activeNotebook.id}
        onSourcesAdded={handleAddSources}
      />

      {/* Source Document Reader Modal (NotebookLM Source Viewer) */}
      <SourceReaderModal
        source={readingSource}
        isOpen={!!readingSource}
        onClose={() => setReadingSource(null)}
        onLoadSimulation={handleLoadSimulation}
      />

      {/* Real-time Voice Assistant HUD & Physical Simulation Controller */}
      <VoiceAssistantHUD
        isVoiceActive={voiceAssistant.isVoiceActive}
        onClose={() => voiceAssistant.setIsVoiceActive(false)}
        isListening={voiceAssistant.isListening}
        isSpeaking={voiceAssistant.isSpeaking}
        isThinking={voiceAssistant.isThinking}
        isMuted={voiceAssistant.isMuted}
        isDemonstrating={voiceAssistant.isDemonstrating}
        lastSpokenText={voiceAssistant.lastSpokenText}
        userTranscript={voiceAssistant.userTranscript}
        onToggleListening={voiceAssistant.toggleListening}
        onToggleMute={voiceAssistant.toggleMute}
        onTriggerDemonstration={voiceAssistant.triggerDemonstration}
        hasSimulation={Boolean(activeNotebook?.simulation)}
        simulationTitle={activeNotebook?.simulation?.title}
        isCompiling={isProcessing || Boolean(activeNotebook?.simulation?.isDynamic && !activeNotebook?.simulation?.previewUrl)}
      />
    </div>
  );
}
