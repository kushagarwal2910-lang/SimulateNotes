"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { smoothSetSlider, getAvailableControls } from "./simulationController";
import { SimulationItem } from "./simulationsData";

export interface ControlAction {
  control: string | number;
  value: number;
  delayMs: number;
}

export interface VoiceAssistantOptions {
  notebookId?: string;
  notebookTitle?: string;
  sources?: any[];
  simulation?: SimulationItem | null;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
}

export function useVoiceAssistant({
  notebookId,
  notebookTitle,
  sources,
  simulation,
  iframeRef,
}: VoiceAssistantOptions = {}) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDemonstrating, setIsDemonstrating] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState("");
  const [userTranscript, setUserTranscript] = useState("");

  const recognitionRef = useRef<any>(null);
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const isSpeakingRef = useRef(isSpeaking);
  isSpeakingRef.current = isSpeaking;

  // Selected voice for SpeechSynthesis
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize SpeechSynthesis Voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prioritize natural sounding modern voices
      const preferredVoice =
        voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Online"))) ||
        voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
        voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Samantha") || v.name.includes("Daniel"))) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0] ||
        null;
      selectedVoiceRef.current = preferredVoice;
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Text-To-Speech function
  const speak = useCallback((text: string, onComplete?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onComplete?.();
      return;
    }

    if (isMutedRef.current) {
      setLastSpokenText(text);
      onComplete?.();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel previous

      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }
      utterance.rate = 1.0; // Natural, friendly conversational speed
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setIsSpeaking(true);
        setLastSpokenText(text);
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        onComplete?.();
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        onComplete?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis error:", e);
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      onComplete?.();
    }
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Core Assistant Query Dispatcher
  const askAssistant = useCallback(
    async (
      userSpeechPrompt?: string,
      stage: "compiling" | "ready" | "demonstrate" = "compiling"
    ) => {
      setIsThinking(true);
      stopSpeaking();

      try {
        const iframe = iframeRef?.current || null;
        const availableControls = getAvailableControls(iframe).map((c) => ({
          index: c.index,
          label: c.label,
          min: c.min ?? 0,
          max: c.max ?? 100,
          currentValue: typeof c.currentValue === "number" ? c.currentValue : 0,
        }));

        const res = await fetch("/api/voice-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notebookId,
            notebookTitle,
            sources,
            userSpeech: userSpeechPrompt,
            stage,
            simulationTitle: simulation?.title,
            simulationSlug: simulation?.slug,
            simulationDescription: simulation?.description,
            simulationEquations: simulation?.equations,
            simulationParameters: simulation?.keyParameters,
            simulationControls: availableControls,
          }),
        });

        const data = await res.json();
        setIsThinking(false);

        if (data.speech) {
          speak(data.speech, () => {
            setIsDemonstrating(false);
          });
        }

        // Execute coordinated physical controls on simulation iframe
        if (data.actions && Array.isArray(data.actions) && data.actions.length > 0 && iframe) {
          setIsDemonstrating(true);
          data.actions.forEach((action: ControlAction) => {
            setTimeout(async () => {
              await smoothSetSlider(iframe, action.control, action.value, 800);
            }, action.delayMs || 500);
          });
        }
      } catch (err) {
        console.error("Error asking voice assistant:", err);
        setIsThinking(false);
      }
    },
    [notebookId, simulation, iframeRef, speak, stopSpeaking]
  );

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    const recognizer = new SpeechRecognitionAPI();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = "en-US";

    recognizer.onresult = (event: any) => {
      // Ignore microphone input while the voice assistant is actively speaking through the speakers
      if (isSpeakingRef.current) return;

      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = (finalTranscript || interimTranscript).trim();
      setUserTranscript(currentText);

      if (finalTranscript.trim()) {
        const query = finalTranscript.trim();
        setUserTranscript("");
        // Pass user's spoken command/question to assistant
        askAssistant(query, simulation ? "ready" : "compiling");
      }
    };

    recognizer.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        console.warn("Speech recognition error:", event.error);
      }
      setIsListening(false);
    };

    recognizer.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognizer;

    return () => {
      try {
        recognizer.stop();
      } catch (e) {}
    };
  }, [askAssistant, simulation]);

  // Start listening to user mic
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      stopSpeaking();
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn("Recognition already started or error:", e);
    }
  }, [stopSpeaking]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (e) {}
  }, []);

  // Toggle user mic listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Toggle Mute of Assistant voice output
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) stopSpeaking();
      return next;
    });
  }, [stopSpeaking]);

  // Trigger Hands-on Demonstration
  const triggerDemonstration = useCallback(() => {
    askAssistant("Walk me through this simulation and demonstrate the controls", "demonstrate");
  }, [askAssistant]);

  // Auto-manage mic listening state when Voice Assistant HUD is opened or closed
  useEffect(() => {
    if (isVoiceActive) {
      const timer = setTimeout(() => {
        startListening();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isVoiceActive, startListening, stopListening, stopSpeaking]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isVoiceActive,
    setIsVoiceActive,
    isListening,
    isSpeaking,
    isThinking,
    isMuted,
    isDemonstrating,
    lastSpokenText,
    userTranscript,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    toggleListening,
    toggleMute,
    askAssistant,
    triggerDemonstration,
  };
}
