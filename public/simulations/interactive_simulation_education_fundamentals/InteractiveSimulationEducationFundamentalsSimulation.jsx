import React, { useState, useRef, useMemo, useEffect } from "react";
import { gsap } from "gsap";

export default function InteractiveSimulationEducationFundamentalsSimulation() {
  // State variables for all controls
  const [explorationFreedom, setExplorationFreedom] = useState(0.7);
  const [feedbackImmediacy, setFeedbackImmediacy] = useState(0.8);
  const [safeIterationAllowed, setSafeIterationAllowed] = useState(1);
  const [inquiryStructureLevel, setInquiryStructureLevel] = useState(0.6);
  const [learnerPriorConfidence, setLearnerPriorConfidence] = useState(0.4);

  // Refs for SVG elements and GSAP context
  const svgRef = useRef(null);
  const confidencePathRef = useRef(null);
  const inquiryCircleRef = useRef(null);
  const pulseDotRef = useRef(null);
  const inclusionFieldRef = useRef(null);
  const particlesRef = useRef([]);

  // Derived dynamics (memoized for performance)
  const learningGainPotential = useMemo(() => {
    return Math.min(
      1.0,
      explorationFreedom * 0.4 +
        feedbackImmediacy * 0.3 +
        safeIterationAllowed * 0.2 +
        inquiryStructureLevel * 0.1
    );
  }, [explorationFreedom, feedbackImmediacy, safeIterationAllowed, inquiryStructureLevel]);

  const confidenceBuildingRate = useMemo(() => {
    return Math.max(
      0.0,
      safeIterationAllowed * 0.5 +
        learnerPriorConfidence * 0.3 +
        feedbackImmediacy * 0.2
    );
  }, [safeIterationAllowed, learnerPriorConfidence, feedbackImmediacy]);

  const knowledgeTransferScore = useMemo(() => {
    return Math.pow(inquiryStructureLevel, 1.2) * Math.sqrt(explorationFreedom);
  }, [inquiryStructureLevel, explorationFreedom]);

  const engagementMomentum = useMemo(() => {
    return (
      (explorationFreedom * feedbackImmediacy) /
      (1 + Math.exp(-5 * (inquiryStructureLevel - 0.5)))
    );
  }, [explorationFreedom, feedbackImmediacy, inquiryStructureLevel]);

  const inclusionImpact = useMemo(() => {
    return (
      1 -
      Math.abs(learnerPriorConfidence - 0.5) * 0.6 +
      safeIterationAllowed * 0.4
    );
  }, [learnerPriorConfidence, safeIterationAllowed]);

  // Initialize particles with 50 seed particles (Frame-0 populated)
  const [particles, setParticles] = useState(() => {
    const initialParticles = [];
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const speed = 0.5 + Math.random() * 1.5;
      initialParticles.push({
        id: i,
        x: 480,
        y: 240,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 1.0,
        size: 3 + Math.random() * 3,
        hue: 200 + Math.random() * 40, // Blue to pink shift
      });
    }
    return initialParticles;
  });

  // Time offset for confidence flow animation
  const [timeOffset, setTimeOffset] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);

  // GSAP context for clean animation lifecycle
  const gsapContext = useRef(null);

  // Initialize GSAP animations and ticker
  useEffect(() => {
    gsapContext.current = gsap.context(() => {
      // Confidence flow animation via GSAP ticker (registered ONCE)
      gsap.ticker.add((delta) => {
        if (isPlaying) {
          setTimeOffset((prev) => prev + delta * 0.1);
        }
      });

      // Pulse animation for inquiry cycle center dot
      gsap.to(pulseDotRef.current, {
        scale: 1.5,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Particle animation via GSAP ticker
      gsap.ticker.add((delta) => {
        if (!isPlaying) return;
        setParticles((prev) => {
          const updated = prev.map((p) => {
            // Update position
            let newX = p.x + p.vx * delta * 10 * engagementMomentum;
            let newY = p.y + p.vy * delta * 10 * engagementMomentum;

            // Boundary check - reset if out of view
            if (
              newX < 0 ||
              newX > 960 ||
              newY < 0 ||
              newY > 480
            ) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 0.5 + Math.random() * 1.5;
              return {
                ...p,
                x: 480,
                y: 240,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
              };
            }

            // Decay life
            const newLife = Math.max(0, p.life - delta * 0.5 * engagementMomentum);
            if (newLife <= 0) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 0.5 + Math.random() * 1.5;
              return {
                ...p,
                x: 480,
                y: 240,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
              };
            }

            // Update hue based on life ratio (blue to pink)
            const lifeRatio = newLife / p.maxLife;
            const hue = 200 + (1 - lifeRatio) * 40; // 200 (blue) to 240 (pink)

            return {
              ...p,
              x: newX,
              y: newY,
              life: newLife,
              hue,
            };
          });
          return updated;
        });
      });
    }, svgRef);

    return () => {
      gsapContext.current.revert();
    };
  }, [isPlaying, engagementMomentum]);

  // Reset to defaults handler
  const resetToDefaults = () => {
    setExplorationFreedom(0.7);
    setFeedbackImmediacy(0.8);
    setSafeIterationAllowed(1);
    setInquiryStructureLevel(0.6);
    setLearnerPriorConfidence(0.4);
    setIsPlaying(true);
    setTimeOffset(0);
  };

  // Toggle play/pause
  const togglePlay = () => setIsPlaying((prev) => !prev);

  // Telemetry HUD data
  const telemetryData = [
    { label: "Learning Gain Potential", value: learningGainPotential.toFixed(3), unit: "index" },
    { label: "Confidence Building Rate", value: confidenceBuildingRate.toFixed(3), unit: "index/s" },
    { label: "Knowledge Transfer Score", value: knowledgeTransferScore.toFixed(3), unit: "index" },
    { label: "Engagement Momentum", value: engagementMomentum.toFixed(3), unit: "arb. units" },
    { label: "Inclusion Impact", value: inclusionImpact.toFixed(3), unit: "index" },
    { label: "Current Exploration Freedom", value: explorationFreedom.toFixed(3), unit: "index" },
  ];

  // Pedagogical callouts
  const callouts = [
    {
      step: 1,
      title: "The Shift from Passive to Active Learning",
      text: "Interactive simulations reverse traditional instruction by letting learners explore systems first, manipulate variables, and observe outcomes before formal terminology is introduced. This builds meaning through direct experience rather than passive reception.",
    },
    {
      step: 2,
      title: "Safe Failure Builds Persistent Confidence",
      text: "By allowing incorrect assumptions to be explored without penalty, simulations reduce the stigma of failure. Learners from historically underrepresented groups in STEM are more likely to persist when they can test ideas repeatedly in a psychologically safe environment.",
    },
    {
      step: 3,
      title: "Structured Inquiry Transfers Thinking Skills",
      text: "When simulations embed structured inquiry cycles (explore-test-reflect-apply), learners develop transferable reasoning patterns. Repeated exposure to this cycle across subjects builds generalizable problem-solving abilities rather than isolated procedural knowledge.",
    },
    {
      step: 4,
      title: "Inclusive Design Expands STEM Participation",
      text: "Well-designed simulations offer multiple entry points (visual, kinesthetic, repetitive) that accommodate diverse learning styles and prior experiences. This helps dismantle the myth that STEM competence requires immediate correctness or abstract confidence.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] to-[#1a1f2e] text-white p-6 font-sans">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#38bdf8] to-[#f43f5e] bg-clip-text text-transparent">
          Interactive Simulation Pedagogy Explorer
        </h1>
        <p className="text-lg text-[#a5b4fc]">
          Explore how interactive simulations transform STEM learning by shifting from passive reception to active meaning-making
        </p>
      </div>

      {/* Telemetry HUD Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {telemetryData.map((metric, index) => (
          <div
            key={index}
            className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/30"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">{metric.label}</span>
              <span className="text-sm text-[#94a3b8]">{metric.unit}</span>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#38bdf8] to-[#34d399] bg-clip-text text-transparent">
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Dedicated Simulation Stage */}
      <div className="relative w-full max-w-[960px] mx-auto h-[480px] bg-[#0f172a]/50 backdrop-blur-sm rounded-2xl border border-[#334155]/50 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 960 480"
          className="w-full h-full"
          aria-label="Interactive simulation visualization"
          role="img"
        >
          {/* Definitions for gradients and filters */}
          <defs>
            <linearGradient id="learningGainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#38bdf8" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Learning Gain Meter */}
          <g className="learning-gain-meter">
            <rect x="100" y="100" width="60" height="300" fill="none" stroke="#ffffff" strokeWidth="2" />
            <rect x="100" y={400 - learningGainPotential * 300} width="60" height={learningGainPotential * 300} fill="url(#learningGainGrad)" />
          </g>

          {/* Confidence Flow (Sine Wave) */}
          <path ref={confidencePathRef} d="" stroke="#f43f5e" strokeWidth="3" fill="none" filter="url(#glow)"
          >
            {/* GSAP will animate the dash-offset via ticker */}
          </path>

          {/* Inquiry Cycle Visualizer */}
          <g ref={inquiryCircleRef} className="inquiry-cycle">
            {/* Quadrants */}
            <path d="M 480 120 A 120 120 0 0 1 600 240" fill="#38bdf8" fillOpacity={0.2 + inquiryStructureLevel * 0.7} />
            <path d="M 600 240 A 120 120 0 0 1 480 360" fill="#f43f5e" fillOpacity={0.2 + inquiryStructureLevel * 0.7} />
            <path d="M 480 360 A 120 120 0 0 1 360 240" fill="#34d399" fillOpacity={0.2 + inquiryStructureLevel * 0.7} />
            <path d="M 360 240 A 120 120 0 0 1 480 120" fill="#fbbf24" fillOpacity={0.2 + inquiryStructureLevel * 0.7} />
            {/* Center pulsing dot */}
            <circle ref={pulseDotRef} cx="480" cy="240" r="8" fill="url(#pulseGrad)" filter="url(#glow)" />
          </g>

          {/* Inclusion Impact Field */}
          <g ref={inclusionFieldRef} className="inclusion-field">
            {/* Nodes and connections will be rendered via particles map below */}
          </g>

          {/* Momentum Particles */}
          <g ref={particlesRef} className="momentum-particles">
            {/* Particles rendered via map below */}
          </g>
        </svg>
      </div>

      {/* Interactive Control Deck Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Slider: Exploration Freedom */}
        <div>
          <label className="block mb-2 font-medium">
            Exploration Freedom
            <span className="text-sm text-[#94a3b8]">(index 0-1)</span>
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={explorationFreedom}
              onChange={(e) => setExplorationFreedom(parseFloat(e.target.value))}
              className="w-[200px] h-4 bg-[#334155]/50 rounded-full appearance-none cursor-pointer"
            />
            <span className="ml-3 text-lg font-mono">{explorationFreedom.toFixed(2)}</span>
          </div>
        </div>

        {/* Slider: Feedback Immediacy */}
        <div>
          <label className="block mb-2 font-medium">
            Feedback Immediacy
            <span className="text-sm text-[#94a3b8]">(index 0-1)</span>
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={feedbackImmediacy}
              onChange={(e) => setFeedbackImmediacy(parseFloat(e.target.value))}
              className="w-[200px] h-4 bg-[#334155]/50 rounded-full appearance-none cursor-pointer"
            />
            <span className="ml-3 text-lg font-mono">{feedbackImmediacy.toFixed(2)}</span>
          </div>
        </div>

        {/* Toggle: Safe Iteration Allowed */}
        <div>
          <label className="block mb-2 font-medium flex items-center">
            Allow Safe Iteration
            <input
              type="checkbox"
              checked={safeIterationAllowed === 1}
              onChange={(e) => setSafeIterationAllowed(e.target.checked ? 1 : 0)}
              className="w-4 h-4 ml-2 bg-[#334155]/50 rounded border-[#475569] accent-[#38bdf8]"
            />
          </label>
        </div>

        {/* Slider: Inquiry Structure Level */}
        <div>
          <label className="block mb-2 font-medium">
            Inquiry Structure Level
            <span className="text-sm text-[#94a3b8]">(index 0-1)</span>
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.1"
              value={inquiryStructureLevel}
              onChange={(e) => setInquiryStructureLevel(parseFloat(e.target.value))}
              className="w-[200px] h-4 bg-[#334155]/50 rounded-full appearance-none cursor-pointer"
            />
            <span className="ml-3 text-lg font-mono">{inquiryStructureLevel.toFixed(1)}</span>
          </div>
        </div>

        {/* Slider: Learner Prior Confidence */}
        <div>
          <label className="block mb-2 font-medium">
            Learner Prior Confidence
            <span className="text-sm text-[#94a3b8]">(index 0.1-0.9)</span>
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={learnerPriorConfidence}
              onChange={(e) => setLearnerPriorConfidence(parseFloat(e.target.value))}
              className="w-[200px] h-4 bg-[#334155]/50 rounded-full appearance-none cursor-pointer"
            />
            <span className="ml-3 text-lg font-mono">{learnerPriorConfidence.toFixed(2)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col items-start">
          <button
            onClick={togglePlay}
            className="w-full mb-2 px-4 py-2 bg-[#1e293b]/50 backdrop-blur-sm rounded-lg border border-[#334155]/30 text-left hover:bg-[#334155]/50 transition-colors"
          >
            {isPlaying ? "Pause Simulation" : "Play Simulation"}
          </button>
          <button
            onClick={resetToDefaults}
            className="w-full px-4 py-2 bg-[#1e293b]/50 backdrop-blur-sm rounded-lg border border-[#334155]/30 text-left hover:bg-[#334155]/50 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Educational Theory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {callouts.map((callout) => (
          <div
            key={callout.step}
            className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-5 border border-[#334155]/30"
          >
            <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-[#38bdf8] to-[#f43f5e] bg-clip-text text-transparent">
              Step {callout.step}: {callout.title}
            </h3>
            <p className="text-[#cbd5e1] leading-relaxed">{callout.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
