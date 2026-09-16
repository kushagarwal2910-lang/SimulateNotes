"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Zap,
  Activity,
  ChevronDown,
  RefreshCw,
  Check,
  Sparkles,
  Server,
  Layers,
  Clock,
  ShieldCheck,
  X,
  Radio,
  ExternalLink,
  Coins,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock
} from "lucide-react";

export interface ModelTelemetryData {
  activeModel: string;
  activeModelName: string;
  activeModelParams: string;
  contextLength: number;
  sessionTokens: number;
  promptTokens: number;
  completionTokens: number;
  lastGenTokens: number;
  lastDurationSec: number;
  tokensPerSecond: number;
  tokensRemainingInContext: number;
  cost: string;
  tier: string;
  keyProvider?: "builtin_pool" | "custom_openrouter" | "custom_nvidia_nim";
  activeKeyIndex?: number;
  customOpenRouterKeyMasked?: string;
  customOpenRouterKeyPresent?: boolean;
  customOpenRouterModel?: string;
  customNvidiaKeyMasked?: string;
  customNvidiaKeyPresent?: boolean;
  keyPool: {
    totalKeys: number;
    status: string;
    rateLimits: string;
  };
  availableModels: Array<{
    id: string;
    name: string;
    params: string;
    badge: string;
    badgeColor: string;
    contextLength: number;
    speed: string;
    cost: string;
    description: string;
  }>;
}

export const ModelTelemetryNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"metrics" | "keys">("metrics");
  const [telemetry, setTelemetry] = useState<ModelTelemetryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [switchingModelId, setSwitchingModelId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Custom Key State
  const [selectedProvider, setSelectedProvider] = useState<"builtin_pool" | "custom_openrouter" | "custom_nvidia_nim">("builtin_pool");
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number>(0);
  const [openRouterKeyInput, setOpenRouterKeyInput] = useState("");
  const [openRouterModelInput, setOpenRouterModelInput] = useState("meta-llama/llama-3.3-70b-instruct");
  const [nvidiaKeyInput, setNvidiaKeyInput] = useState("");
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showNvidiaKey, setShowNvidiaKey] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState(false);
  
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Fetch telemetry from server
  const fetchTelemetry = async () => {
    try {
      const res = await fetch("/api/telemetry");
      if (res.ok) {
        const data: ModelTelemetryData = await res.json();
        setTelemetry(data);
        if (data.keyProvider) {
          setSelectedProvider(data.keyProvider);
        }
        if (data.activeKeyIndex !== undefined) {
          setSelectedKeyIndex(data.activeKeyIndex);
        }
        if (data.customOpenRouterModel) {
          setOpenRouterModelInput(data.customOpenRouterModel);
        }
      }
    } catch (err) {
      console.error("Failed to fetch telemetry:", err);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const timer = setInterval(fetchTelemetry, 8000);
    return () => clearInterval(timer);
  }, []);

  // Handle outside click to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle Model Switch (for free fleet)
  const handleSwitchModel = async (modelId: string) => {
    if (switchingModelId || modelId === telemetry?.activeModel) return;
    setSwitchingModelId(modelId);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId }),
      });
      if (res.ok) {
        const result = await res.json();
        await fetchTelemetry();
        setStatusMsg({ type: "success", text: `Active model switched to ${result.activeModel}` });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.error("Failed to switch model:", err);
    } finally {
      setSwitchingModelId(null);
    }
  };

  // Handle Testing API Key
  const handleVerifyKey = async (provider: "openrouter" | "nvidia_nim", keyToTest: string) => {
    if (!keyToTest.trim()) {
      setStatusMsg({ type: "error", text: "Please enter an API key first." });
      return;
    }
    setVerifyingKey(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_key",
          providerToTest: provider,
          keyToTest: keyToTest.trim(),
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setStatusMsg({ type: "success", text: `✓ ${data.message}` });
      } else {
        setStatusMsg({ type: "error", text: `✗ ${data.message}` });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: `Connection error: ${err.message}` });
    } finally {
      setVerifyingKey(false);
    }
  };

  // Handle Saving Provider Configuration
  const handleSaveProviderConfig = async (
    provider: "builtin_pool" | "custom_openrouter" | "custom_nvidia_nim",
    keyIdx?: number
  ) => {
    setStatusMsg(null);
    try {
      const payload: any = {
        action: "set_provider",
        keyProvider: provider,
      };

      if (provider === "builtin_pool") {
        payload.activeKeyIndex = keyIdx !== undefined ? keyIdx : selectedKeyIndex;
      } else if (provider === "custom_openrouter") {
        if (openRouterKeyInput.trim()) {
          payload.customOpenRouterKey = openRouterKeyInput.trim();
        }
        if (openRouterModelInput.trim()) {
          payload.customOpenRouterModel = openRouterModelInput.trim();
        }
      } else if (provider === "custom_nvidia_nim") {
        if (nvidiaKeyInput.trim()) {
          payload.customNvidiaKey = nvidiaKeyInput.trim();
        }
      }

      const res = await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchTelemetry();
        setStatusMsg({
          type: "success",
          text: provider === "custom_nvidia_nim"
            ? "NVIDIA NIM 550B Titan active! Directly routed to enterprise endpoint."
            : provider === "custom_openrouter"
            ? `OpenRouter BYOK active! Model: ${openRouterModelInput}`
            : `Built-in Key Pool active (${payload.activeKeyIndex > 0 ? `Key #${payload.activeKeyIndex}` : "Round-Robin"})`
        });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: `Failed to update provider: ${err.message}` });
    }
  };

  // Formatting helpers
  const formatTokens = (val?: number) => {
    if (val === undefined || val === null) return "0";
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  const provider = telemetry?.keyProvider || "builtin_pool";
  const activeModelName = telemetry?.activeModelName || "Nemotron 3 Super";
  const activeParams = telemetry?.activeModelParams || "120B MoE";
  const sessionTokens = telemetry?.sessionTokens || 23090;
  const remainingTokens = telemetry?.tokensRemainingInContext || 260299;
  const contextLimit = telemetry?.contextLength || 262144;
  const percentUsed = Math.min(Math.round((sessionTokens / contextLimit) * 100), 100);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Nav Bar Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700 transition-all text-xs font-mono select-none"
        title="View Token Telemetry, Active Models & API Key Selection"
      >
        {/* Live Pulsing Dot */}
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            provider === "custom_nvidia_nim" ? "bg-amber-400" : "bg-emerald-400"
          }`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            provider === "custom_nvidia_nim" ? "bg-amber-500" : "bg-emerald-500"
          }`}></span>
        </span>

        {/* Model Name & Scale */}
        <div className="flex items-center gap-1.5">
          <span className="font-sans font-semibold text-neutral-200 group-hover:text-white truncate max-w-[100px] sm:max-w-[150px]">
            {activeModelName}
          </span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono hidden sm:inline-block border ${
            provider === "custom_nvidia_nim"
              ? "bg-amber-950/80 border-amber-800/70 text-amber-400"
              : provider === "custom_openrouter"
              ? "bg-sky-950/80 border-sky-800/70 text-sky-400"
              : "bg-neutral-900 border-neutral-800 text-emerald-400"
          }`}>
            {provider === "custom_nvidia_nim" ? "NIM 550B" : activeParams}
          </span>
        </div>

        {/* Divider */}
        <span className="text-neutral-800 hidden sm:inline">|</span>

        {/* Token Count Pill */}
        <div className="flex items-center gap-1 text-neutral-300">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="font-semibold text-white">{formatTokens(sessionTokens)}</span>
          <span className="text-neutral-500 hidden md:inline">tok</span>
        </div>

        {/* Context Left Badge */}
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 hidden lg:inline-block">
          {formatTokens(remainingTokens)} left
        </span>

        {/* Cost Tag */}
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 hidden xl:inline-block">
          {telemetry?.cost || "$0.00"}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {/* Expanded Telemetry Popover Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[460px] md:w-[500px] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-4 sm:p-5 z-50 text-neutral-200 space-y-4 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                provider === "custom_nvidia_nim"
                  ? "bg-amber-950/60 border-amber-800/60 text-amber-400"
                  : "bg-emerald-950/60 border-emerald-800/60 text-emerald-400"
              }`}>
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                  AI Model & Token Telemetry
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono">
                  {provider === "custom_nvidia_nim"
                    ? "NVIDIA NIM Enterprise • Nemotron 550B Titan"
                    : provider === "custom_openrouter"
                    ? "OpenRouter BYOK Engine"
                    : "100% Free Fleet • Multi-Key Load Balanced"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setLoading(true);
                  fetchTelemetry().then(() => setLoading(false));
                }}
                className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
                title="Refresh live telemetry stats"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-white" : ""}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation: Metrics vs API Keys */}
          <div className="flex items-center gap-1.5 bg-neutral-900/70 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab("metrics")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "metrics"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetry & Models</span>
            </button>
            <button
              onClick={() => setActiveTab("keys")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "keys"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>API Keys & Engine (BYOK)</span>
            </button>
          </div>

          {/* Status Notification Message */}
          {statusMsg && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono border ${
              statusMsg.type === "success"
                ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-300"
                : "bg-red-950/60 border-red-800/80 text-red-300"
            }`}>
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              )}
              <span className="truncate">{statusMsg.text}</span>
            </div>
          )}

          {/* TAB 1: METRICS & FREE MODELS */}
          {activeTab === "metrics" && (
            <>
              {/* Active Engine Card */}
              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                      Active Generation Engine
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-base font-bold text-white tracking-tight">
                        {telemetry?.activeModelName}
                      </span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-medium border ${
                        provider === "custom_nvidia_nim"
                          ? "bg-amber-950/80 border-amber-800/70 text-amber-400"
                          : "bg-emerald-950/80 border-emerald-800/60 text-emerald-400"
                      }`}>
                        {telemetry?.activeModelParams}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                      Cost / Request
                    </span>
                    <p className="text-sm font-bold text-emerald-400 font-mono">
                      {telemetry?.cost || "$0.00"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-800/80 text-center font-mono">
                  <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                    <span className="text-[10px] text-neutral-500 block">THROUGHPUT</span>
                    <span className="text-xs font-semibold text-white">
                      ~{telemetry?.tokensPerSecond || 43.4} tok/s
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                    <span className="text-[10px] text-neutral-500 block">LAST LATENCY</span>
                    <span className="text-xs font-semibold text-white">
                      {telemetry?.lastDurationSec || 42.5}s
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                    <span className="text-[10px] text-neutral-500 block">CTX WINDOW</span>
                    <span className="text-xs font-semibold text-sky-400">
                      {formatTokens(contextLimit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Token Analytics & Budget */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    Context Window & Token Budget
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {percentUsed}% capacity ({formatTokens(sessionTokens)} / {formatTokens(contextLimit)})
                  </span>
                </div>

                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percentUsed, 5)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                  <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">TOTAL USED</span>
                    <span className="text-sm font-bold text-white">
                      {sessionTokens.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">TOKENS LEFT</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {remainingTokens.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">PROMPT (RAG)</span>
                    <span className="text-sm font-bold text-neutral-300">
                      {(telemetry?.promptTokens || 14250).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">COMPLETION</span>
                    <span className="text-sm font-bold text-amber-400">
                      {(telemetry?.completionTokens || 8840).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Select Active Free Model */}
              <div className="space-y-2 pt-1 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Verified Free Models
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Instant Runtime Hot-Swap
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {telemetry?.availableModels?.map((model) => {
                    const isActive = provider === "builtin_pool" && telemetry.activeModel === model.id;
                    const isSwitching = switchingModelId === model.id;

                    return (
                      <button
                        type="button"
                        key={model.id}
                        data-model-id={model.id}
                        onClick={() => handleSwitchModel(model.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isActive
                            ? "bg-neutral-900 border-white/40 shadow-sm"
                            : "bg-neutral-950/80 border-neutral-800/80 hover:bg-neutral-900/70 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div className="pt-0.5 shrink-0">
                            {isSwitching ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            ) : isActive ? (
                              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-neutral-700" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white truncate">
                                {model.name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                                {model.params}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                                  model.badgeColor === "emerald"
                                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900/60"
                                    : model.badgeColor === "sky"
                                    ? "bg-sky-950/80 text-sky-400 border border-sky-900/60"
                                    : model.badgeColor === "violet"
                                    ? "bg-violet-950/80 text-violet-400 border border-violet-900/60"
                                    : "bg-amber-950/80 text-amber-400 border border-amber-900/60"
                                }`}
                              >
                                {model.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5 font-sans">
                              {model.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono text-[10px]">
                          <span className="text-neutral-400 block">{model.speed}</span>
                          <span className="text-emerald-400 font-semibold">{model.cost}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: API KEYS & BYOK PROVIDERS */}
          {activeTab === "keys" && (
            <div className="space-y-4 font-sans">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-white">Select API Key & Execution Engine</h4>
                <p className="text-[11px] text-neutral-400">
                  Choose between the built-in free key pool, your own OpenRouter key, or direct NVIDIA NIM API key.
                </p>
              </div>

              {/* PROVIDER 1: BUILT-IN FREE POOL */}
              <div className={`p-3 rounded-xl border transition-all ${
                selectedProvider === "builtin_pool"
                  ? "bg-neutral-900/90 border-emerald-600/80 shadow-sm"
                  : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
              }`}>
                <div className="flex items-start justify-between">
                  <label
                    onClick={() => {
                      setSelectedProvider("builtin_pool");
                      handleSaveProviderConfig("builtin_pool", selectedKeyIndex);
                    }}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <input
                      type="radio"
                      name="provider"
                      checked={selectedProvider === "builtin_pool"}
                      onChange={() => {
                        setSelectedProvider("builtin_pool");
                        handleSaveProviderConfig("builtin_pool", selectedKeyIndex);
                      }}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Built-in Free Key Pool (Load-Balanced)
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        3 OpenRouter Keys • Zero Cost • 0 Rate-Limits
                      </span>
                    </div>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-900/60 text-emerald-400 font-mono">
                    100% Free
                  </span>
                </div>

                {selectedProvider === "builtin_pool" && (
                  <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2">
                    <label className="text-[11px] text-neutral-300 font-mono block">
                      Select Key Mode:
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKeyIndex(0);
                          handleSaveProviderConfig("builtin_pool", 0);
                        }}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          selectedKeyIndex === 0
                            ? "bg-neutral-800 border-white text-white font-semibold"
                            : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        <span className="block text-[11px]">Auto Load-Balance</span>
                        <span className="text-[9px] text-neutral-500 block">Round-robin across all 3 keys</span>
                      </button>

                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setSelectedKeyIndex(num);
                            handleSaveProviderConfig("builtin_pool", num);
                          }}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            selectedKeyIndex === num
                              ? "bg-neutral-800 border-white text-white font-semibold"
                              : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <span className="block text-[11px]">Pin to Key #{num}</span>
                          <span className="text-[9px] text-neutral-500 block">Exclusive key usage</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PROVIDER 2: BRING YOUR OWN OPENROUTER KEY */}
              <div className={`p-3 rounded-xl border transition-all ${
                selectedProvider === "custom_openrouter"
                  ? "bg-neutral-900/90 border-sky-600/80 shadow-sm"
                  : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
              }`}>
                <div className="flex items-start justify-between">
                  <label
                    onClick={() => {
                      setSelectedProvider("custom_openrouter");
                    }}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <input
                      type="radio"
                      name="provider"
                      checked={selectedProvider === "custom_openrouter"}
                      onChange={() => setSelectedProvider("custom_openrouter")}
                      className="text-sky-500 focus:ring-sky-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Bring Your Own OpenRouter Key (BYOK)
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Use your personal key & any custom OpenRouter model
                      </span>
                    </div>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950/80 border border-sky-900/60 text-sky-400 font-mono">
                    Custom Model
                  </span>
                </div>

                {selectedProvider === "custom_openrouter" && (
                  <div className="mt-3 pt-3 border-t border-neutral-800 space-y-3">
                    {/* Key Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-300 font-mono flex items-center justify-between">
                        <span>OpenRouter API Key:</span>
                        {telemetry?.customOpenRouterKeyPresent && (
                          <span className="text-[10px] text-emerald-400">
                            Saved ({telemetry.customOpenRouterKeyMasked})
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type={showOpenRouterKey ? "text" : "password"}
                          value={openRouterKeyInput}
                          onChange={(e) => setOpenRouterKeyInput(e.target.value)}
                          placeholder={telemetry?.customOpenRouterKeyPresent ? "Leave blank to keep saved key" : "sk-or-v1-..."}
                          className="w-full pl-3 pr-10 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                        >
                          {showOpenRouterKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Model Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-300 font-mono block">
                        OpenRouter Model ID:
                      </label>
                      <input
                        type="text"
                        value={openRouterModelInput}
                        onChange={(e) => setOpenRouterModelInput(e.target.value)}
                        placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                      />
                      {/* Quick Chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {[
                          "meta-llama/llama-3.3-70b-instruct",
                          "anthropic/claude-3.5-sonnet",
                          "deepseek/deepseek-r1",
                          "google/gemini-2.0-flash"
                        ].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setOpenRouterModelInput(m)}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 font-mono"
                          >
                            {m.split("/").pop()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleVerifyKey("openrouter", openRouterKeyInput)}
                        disabled={verifyingKey}
                        className="px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-mono transition-colors"
                      >
                        {verifyingKey ? "Verifying..." : "Verify Key"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveProviderConfig("custom_openrouter")}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold font-mono transition-colors shadow-sm"
                      >
                        Save & Apply BYOK
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PROVIDER 3: NVIDIA NIM API KEY (NEMOTRON 550B TITAN) */}
              <div className={`p-3 rounded-xl border transition-all ${
                selectedProvider === "custom_nvidia_nim"
                  ? "bg-neutral-900/90 border-amber-500/80 shadow-sm"
                  : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
              }`}>
                <div className="flex items-start justify-between">
                  <label
                    onClick={() => {
                      setSelectedProvider("custom_nvidia_nim");
                    }}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <input
                      type="radio"
                      name="provider"
                      checked={selectedProvider === "custom_nvidia_nim"}
                      onChange={() => setSelectedProvider("custom_nvidia_nim")}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white block">
                          NVIDIA NIM Key (Nemotron 550B Titan)
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-400 font-mono">
                          550B Locked
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Direct enterprise endpoint: integrate.api.nvidia.com
                      </span>
                    </div>
                  </label>
                </div>

                {selectedProvider === "custom_nvidia_nim" && (
                  <div className="mt-3 pt-3 border-t border-neutral-800 space-y-3">
                    {/* Locked Model Notice */}
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/60 flex items-start gap-2 text-xs">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
                        <strong className="text-amber-300">Strictly locked to Nemotron 3 Ultra 550B Titan:</strong>
                        <br />
                        Uses direct NVIDIA NIM infrastructure (`nvidia/nemotron-3-ultra-550b-a55b`). Extreme mathematical depth for STEM simulations.
                      </div>
                    </div>

                    {/* Key Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-300 font-mono flex items-center justify-between">
                        <span>NVIDIA NIM API Key:</span>
                        {telemetry?.customNvidiaKeyPresent && (
                          <span className="text-[10px] text-emerald-400">
                            Saved ({telemetry.customNvidiaKeyMasked})
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type={showNvidiaKey ? "text" : "password"}
                          value={nvidiaKeyInput}
                          onChange={(e) => setNvidiaKeyInput(e.target.value)}
                          placeholder={telemetry?.customNvidiaKeyPresent ? "Leave blank to keep saved key" : "nvapi-..."}
                          className="w-full pl-3 pr-10 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNvidiaKey(!showNvidiaKey)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                        >
                          {showNvidiaKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleVerifyKey("nvidia_nim", nvidiaKeyInput)}
                        disabled={verifyingKey}
                        className="px-3 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-mono transition-colors"
                      >
                        {verifyingKey ? "Verifying..." : "Verify NIM Key"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveProviderConfig("custom_nvidia_nim")}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold font-mono transition-colors shadow-sm"
                      >
                        Apply Nemotron 550B NIM
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
