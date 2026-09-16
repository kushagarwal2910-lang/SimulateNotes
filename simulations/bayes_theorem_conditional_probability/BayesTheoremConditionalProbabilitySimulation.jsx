import React, { useState, useMemo, useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function BayesTheoremConditionalProbabilitySimulation() {
  const [priorLeft, setPriorLeft] = useState(0.5);
  const [likelihoodRedLeft, setLikelihoodRedLeft] = useState(0.7);
  const [likelihoodRedRight, setLikelihoodRedRight] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);

  const priorRight = 1 - priorLeft;
  const jointRedLeft = priorLeft * likelihoodRedLeft;
  const jointRedRight = priorRight * likelihoodRedRight;
  const totalProbRed = jointRedLeft + jointRedRight;
  const posteriorLeftGivenRed = totalProbRed > 0 ? jointRedLeft / totalProbRed : 0;
  const posteriorRightGivenRed = totalProbRed > 0 ? jointRedRight / totalProbRed : 0;

  const leftBagRef = useRef(null);
  const rightBagRef = useRef(null);
  const evidenceMarbleRef = useRef(null);
  const flowLeftRef = useRef(null);
  const flowRightRef = useRef(null);

  const pulseTl = useRef(null);
  const flowLeftTl = useRef(null);
  const flowRightTl = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      pulseTl.current = gsap.to(evidenceMarbleRef.current, {
        attr: { r: 16 },
        opacity: 0.7,
        yoyo: true,
        repeat: -1,
        duration: 0.8,
        ease: "power1.inOut"
      });

      const updateFlow = () => {
        const leftWidth = Math.max(2, jointRedLeft * 20);
        const rightWidth = Math.max(2, jointRedRight * 20);

        if (flowLeftTl.current) flowLeftTl.current.kill();
        if (flowRightTl.current) flowRightTl.current.kill();

        flowLeftTl.current = gsap.to(flowLeftRef.current, {
          strokeWidth: leftWidth,
          duration: 0.5,
          ease: "power2.out"
        });

        flowRightTl.current = gsap.to(flowRightRef.current, {
          strokeWidth: rightWidth,
          duration: 0.5,
          ease: "power2.out"
        });
      };

      updateFlow();
    }, null);

    return () => ctx.revert();
  }, [priorLeft, likelihoodRedLeft, likelihoodRedRight, jointRedLeft, jointRedRight]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setPriorLeft(0.5);
    setLikelihoodRedLeft(0.7);
    setLikelihoodRedRight(0.3);
    setIsPlaying(false);
  };

  const telemetryMetrics = [
    { label: "Prior: Left Bag", value: priorLeft.toFixed(3) },
    { label: "Prior: Right Bag", value: priorRight.toFixed(3) },
    { label: "P(Red ∩ Left)", value: jointRedLeft.toFixed(3) },
    { label: "P(Red ∩ Right)", value: jointRedRight.toFixed(3) },
    { label: "Total P(Red)", value: totalProbRed.toFixed(3) },
    { label: "P(Left | Red) [Posterior]", value: posteriorLeftGivenRed.toFixed(3) },
    { label: "P(Right | Red) [Posterior]", value: posteriorRightGivenRed.toFixed(3) }
  ];

  const pedagogicalCallouts = [
    {
      step: 1,
      title: "Setting the Priors",
      text: "Begin by establishing your initial beliefs: what is the probability the marble came from the left bag before seeing any evidence? This is P(Left). The right bag gets the remaining probability: P(Right) = 1 - P(Left)."
    },
    {
      step: 2,
      title: "Introducing the Evidence",
      text: "Now, observe the evidence: a red marble is drawn. How likely is this evidence under each hypothesis? P(Red|Left) and P(Red|Right) represent these likelihoods. The joint probability P(Red ∩ Left) = P(Left) * P(Red|Left) quantifies the chance of both the hypothesis and evidence occurring together."
    },
    {
      step: 3,
      title: "Updating Beliefs via Bayes' Theorem",
      text: "Bayes' Theorem normalizes the joint probabilities by the total evidence probability: P(Left|Red) = P(Red ∩ Left) / P(Red). The posterior probability tells us our updated belief that the marble came from the left bag after seeing the red evidence. Notice how changing likelihoods or priors shifts the posterior."
    },
    {
      step: 4,
      title: "The Role of Total Evidence",
      text: "The denominator P(Red) = P(Red∩Left) + P(Red∩Right) ensures the posterior probabilities sum to 1. It represents the overall chance of observing a red marble from either bag. If one bag is much more likely to produce red, it dominates the posterior even with a modest prior."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] to-[#111827] text-white p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#38bdf8] to-[#f43f5e]">
          Bayes' Theorem: Updating Beliefs with Evidence
        </h1>
        <p className="mt-2 text-sm text-[#94a3b8]">
          Manipulate priors and likelihoods to see how evidence updates beliefs in real-time
        </p>
      </header>

      <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-7">
        {telemetryMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/50 text-center"
          >
            <div className="text-xs text-[#94a3b8] mb-1">{metric.label}</div>
            <div className="text-lg font-mono font-bold">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="relative h-[500px] w-full mb-8">
        <svg
          viewBox="0 0 960 480"
          className="w-full h-full"
          style={{ backgroundColor: "#0b0f19" }}
        >
          <defs>
            <radialGradient id="marbleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#34d399" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Left Bag */}
          <g ref={leftBagRef}>
            <path d="M150,200 C120,280 180,320 240,280 L150,200 Z" fill="#34d399" stroke="#38bdf8" strokeWidth="2"
            >
              {/* Red marbles (7) */}
              {Array.from({ length: 7 }).map((_, i) => (
                <circle key={i} cx={160 + (i % 3) * 20} cy={210 + Math.floor(i / 3) * 20} r="8" fill="#f43f5e"
                />
              ))}
              {/* Black marbles (3) */}
              {Array.from({ length: 3 }).map((_, i) => (
                <circle key={i + 7} cx={160 + (i % 3) * 20} cy={250 + Math.floor(i / 3) * 20} r="8" fill="#0f172a"
                />
              ))}
            </path>
          </g>

          {/* Right Bag */}
          <g ref={rightBagRef}>
            <path d="M750,200 C720,280 780,320 840,280 L750,200 Z" fill="#34d399" stroke="#38bdf8" strokeWidth="2"
            >
              {/* Red marbles (3) */}
              {Array.from({ length: 3 }).map((_, i) => (
                <circle key={i} cx={760 + (i % 3) * 20} cy={210 + Math.floor(i / 3) * 20} r="8" fill="#f43f5e"
                />
              ))}
              {/* Black marbles (7) */}
              {Array.from({ length: 7 }).map((_, i) => (
                <circle key={i + 3} cx={760 + (i % 3) * 20} cy={250 + Math.floor(i / 3) * 20} r="8" fill="#0f172a"
                />
              ))}
            </path>
          </g>

          {/* Evidence Marble */}
          <circle ref={evidenceMarbleRef} cx="480" cy="420" r="12" fill="#f43f5e" opacity="0" filter="url(#glow)"
          />

          {/* Probability Flow Left */}
          <path ref={flowLeftRef} d="M180,240 C250,180 400,180 480,420 M480,420 C520,380 580,380 620,300" fill="none" stroke="#38bdf8" strokeWidth="4" opacity="0.6" strokeDasharray="0"
          />

          {/* Probability Flow Right */}
          <path ref={flowRightRef} d="M780,240 C710,180 560,180 480,420 M480,420 C440,380 380,380 340,300" fill="none" stroke="#f43f5e" strokeWidth="4" opacity="0.6" strokeDasharray="0"
          />
        </svg>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex justify-between">
            Prior Probability: Left Bag
            <span>{(priorLeft * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0.01"
            max="0.99"
            step="0.01"
            value={priorLeft}
            onChange={(e) => setPriorLeft(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#334155]/50 rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex justify-between">
            Likelihood: P(Red | Left Bag)
            <span>{(likelihoodRedLeft * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0.01"
            max="0.99"
            step="0.01"
            value={likelihoodRedLeft}
            onChange={(e) => setLikelihoodRedLeft(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#334155]/50 rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex justify-between">
            Likelihood: P(Red | Right Bag)
            <span>{(likelihoodRedRight * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0.01"
            max="0.99"
            step="0.01"
            value={likelihoodRedRight}
            onChange={(e) => setLikelihoodRedRight(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#334155]/50 rounded"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:space-x-3">
          <button
            onClick={handlePlayPause}
            className="flex-1 py-2 px-4 bg-[#38bdf8]/20 hover:bg-[#38bdf8]/30 text-[#38bdf8] font-medium rounded-lg transition-colors border border-[#38bdf8]/50"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-[#64748b]/20 hover:bg-[#64748b]/30 text-[#64748b] font-medium rounded-lg transition-colors border border-[#64748b]/50"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {pedagogicalCallouts.map((callout) => (
          <div
            key={callout.step}
            className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-5 border border-[#334155]/50"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-[#38bdf8]/20 text-[38bdf8] w-8 h-8 flex items-center justify-center rounded-md mt-0.5">
                {callout.step}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{callout.title}</h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">{callout.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
