import React, { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function ButterflyLifeCycleSimulation() {
  const [temperature, setTemperature] = useState(25);
  const [foodAvailability, setFoodAvailability] = useState(0.7);
  const [predationRisk, setPredationRisk] = useState(0.3);
  const [initialEggCount, setInitialEggCount] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const svgRef = useRef(null);
  const gsapContextRef = useRef(null);

  const eggHatchRate = useMemo(() => 0.05 * Math.exp(0.08 * (temperature - 25)), [temperature]);
  const larvalGrowthRate = useMemo(() => 0.12 * (foodAvailability / (foodAvailability + 0.3)) * Math.exp(0.06 * (temperature - 25)), [foodAvailability, temperature]);
  const pupationProbability = useMemo(() => {
    const larvalMass = Math.min(1.5, initialEggCount * 0.02 * larvalGrowthRate * (20 / larvalGrowthRate));
    return 1 / (1 + Math.exp(-2 * (larvalMass - 0.8)));
  }, [initialEggCount, larvalGrowthRate]);
  const adultEmergenceRate = useMemo(() => 0.03 * Math.exp(0.07 * (temperature - 25)) * (1 - predationRisk), [temperature, predationRisk]);
  const timeInLarvalStage = useMemo(() => 20 / larvalGrowthRate, [larvalGrowthRate]);
  const timeInPupalStage = useMemo(() => 15 / (0.02 * Math.exp(0.05 * (temperature - 25))), [temperature]);
  const survivalToAdult = useMemo(() => {
    const larvalMass = Math.min(1.5, initialEggCount * 0.02 * larvalGrowthRate * (20 / larvalGrowthRate));
    const pupProb = 1 / (1 + Math.exp(-2 * (larvalMass - 0.8)));
    return initialEggCount * Math.exp(-eggHatchRate * 3) * Math.exp(-larvalGrowthRate * (20 / larvalGrowthRate)) * pupProb * Math.exp(-adultEmergenceRate * (15 / (0.02 * Math.exp(0.05 * (temperature - 25)))));
  }, [initialEggCount, eggHatchRate, larvalGrowthRate, temperature, predationRisk]);

  const telemetryMetrics = [
    { label: "Eggs Hatching/Hour", value: (eggHatchRate * initialEggCount).toFixed(1), unit: "eggs/hr" },
    { label: "Larval Growth Rate", value: larvalGrowthRate.toFixed(3), unit: "mass/day" },
    { label: "Pupation Success %", value: (pupationProbability * 100).toFixed(1), unit: "%" },
    { label: "Adults Emerging/Hour", value: (adultEmergenceRate * survivalToAdult).toFixed(2), unit: "butterflies/hr" },
    { label: "Total Survival to Adult", value: survivalToAdult.toFixed(0), unit: "individuals" }
  ];

  const educationalCards = [
    { step: 1, title: "Stage 1: Egg", text: "Female butterflies lay eggs on host plant leaves. Temperature significantly affects hatch rate - warmer temperatures accelerate embryonic development via increased metabolic activity." },
    { step: 2, title: "Stage 2: Larva (Caterpillar)", text: "Caterpillars consume leaves to grow. Food availability directly impacts growth rate and time to pupation, while predation risk increases with feeding activity and movement." },
    { step: 3, title: "Stage 3: Pupa (Chrysalis)", text: "Inside the chrysalis, histolysis and histogenesis transform larval tissues into adult structures. Temperature influences the rate of this biochemical reorganization." },
    { step: 4, title: "Stage 4: Adult (Imago)", text: "Emerging adults expand wings by pumping hemolymph. Survival to adulthood depends on successful completion of prior stages and avoidance of predators during vulnerable expansion period." }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!isPlaying) return;
      gsap.to({}, {
        duration: 0.016,
        onUpdate: () => setTime(t => t + 0.016),
        repeat: -1
      });
    }, svgRef.current);
    gsapContextRef.current = ctx;
    return () => ctx.revert();
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetSimulation = () => {
    setIsPlaying(false);
    setTime(0);
    setTemperature(25);
    setFoodAvailability(0.7);
    setPredationRisk(0.3);
    setInitialEggCount(50);
  };

  const leafPath = "M100 400 Q200 100 400 200 T700 400 L720 440 Q520 300 280 300 Z";
  const stemPath = "M400 200 L400 100";

  const eggs = useMemo(() => {
    const arr = [];
    for (let i = 0; i < Math.min(initialEggCount, 30); i++) {
      arr.push({
        id: i,
        x: 150 + (i % 5) * 30,
        y: 350 + Math.floor(i / 5) * 20,
        hatched: false
      });
    }
    return arr;
  }, [initialEggCount]);

  const caterpillars = useMemo(() => {
    const arr = [];
    const count = Math.min(10, Math.floor(survivalToAdult * 0.2));
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        progress: (i / count) * 0.8,
        phase: 0
      });
    }
    return arr;
  }, [survivalToAdult]);

  const chrysalides = useMemo(() => {
    const arr = [];
    const count = Math.min(8, Math.floor(survivalToAdult * 0.15));
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        x: 350 + i * 20,
        y: 150,
        pulse: 0
      });
    }
    return arr;
  }, [survivalToAdult]);

  const butterflies = useMemo(() => {
    const arr = [];
    const count = Math.min(5, Math.floor(survivalToAdult * 0.1));
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        x: 500 + i * 60,
        y: 100,
        wingAngle: 0,
        flapDir: 1
      });
    }
    return arr;
  }, [survivalToAdult]);

  useEffect(() => {
    if (!isPlaying) return;
    const ctx = gsap.context(() => {
      caterpillars.forEach(c => {
        gsap.to(c, {
          progress: "+=0.001",
          phase: "+=0.1",
          duration: 0.1,
          repeat: -1,
          ease: "none"
        });
      });
      chrysalides.forEach(ch => {
        gsap.to(ch, {
          pulse: "+=0.05",
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });
      butterflies.forEach(b => {
        gsap.to(b, {
          wingAngle: "+=10",
          duration: 0.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });
    }, svgRef.current);
    gsapContextRef.current = ctx;
    return () => ctx.revert();
  }, [isPlaying, caterpillars, chrysalides, butterflies]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-sans">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Butterfly Metamorphosis: From Egg to Adult</h1>
        <p className="text-sm text-muted-foreground">Entomology & Insect Development Biology</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 text-center text-sm">
        {telemetryMetrics.map((metric, idx) => (
          <div key={idx} className="p-3 bg-muted border rounded-lg">
            <div className="font-medium">{metric.label}</div>
            <div className="text-primary">{metric.value} {metric.unit}</div>
          </div>
        ))}
      </div>

      <div className="relative w-full h-[500px] min-h-[500px] bg-background rounded-xl overflow-hidden border border-muted/20">
        <svg ref={svgRef} className="w-full h-full" viewBox="0 0 960 480">
          <defs>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <filter id="leafGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity={0.35} />
            </filter>
          </defs>

          {/* Layer 1: Environment Grid */}
          <g className="stroke-muted/10">
            <path d="M0 240 L960 240" />
            <path d="M480 0 L480 480" />
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(x => (
              <path key={x} d={`M${x*9.6} 0 L${x*9.6} 480`} />
            ))}
            {[10, 20, 30, 40].map(y => (
              <path key={y} d={`M0 ${y*12} L960 ${y*12}`} />
            ))}
          </g>

          {/* Layer 2: Primary Enclosure (Leaf Silhouette) */}
          <path d={leafPath} fill="none" stroke={leafPath} strokeWidth="2" />

          {/* Layer 3: Volumetric Medium (Leaf Fill) */}
          <path d={leafPath} fill="url(#leafGrad)" filter="url(#leafGlow)" opacity={0.3 + foodAvailability * 0.4} />

          {/* Nutrient Veins */}
          <g stroke={leafPath} strokeWidth="1" opacity={0.6 + foodAvailability * 0.3}>
            <path d="M250 150 Q300 100 350 150" />
            <path d="M400 150 Q450 100 500 150" />
            <path d="M300 200 Q350 180 400 200" />
            <path d="M400 200 Q450 180 500 200" />
            <path d="M350 250 Q400 230 450 250" />
          </g>

          {/* Stem */}
          <path d={stemPath} stroke={leafPath} strokeWidth="3" />

          {/* Layer 4: Kinetic Actors */}
          {/* Eggs */}
          <g>
            {eggs.map(egg => (
              <circle key={egg.id} cx={egg.x} cy={egg.y} r={egg.hatched ? 0 : 4} fill={egg.hatched ? "none" : "#f43f5e"} opacity={egg.hatched ? 0 : 0.8}
              >
                {egg.hatched && gsap.to(egg, { r: 8, duration: 0.5, repeat: -1, yoyo: true })}
              </circle>
            ))}
          </g>

          {/* Caterpillars */}
          <g>
            {caterpillars.map(cat => {
              const pos = cat.progress;
              const x = 100 + pos * 600;
              const y = 380 + Math.sin(cat.phase * Math.PI * 2) * 10;
              return (
                <g key={cat.id} transform={`translate(${x},${y})`}>
                  <path d="M0 0 Q5 5 10 0 Q15 -5 20 0 Q25 5 30 0" fill="none" stroke="#65a30d" strokeWidth="2" />
                  <circle cx="0" cy="0" r="3" fill="#65a30d" />
                </g>
              );
            })}
          </g>

          {/* Chrysalides */}
          <g>
            {chrysalides.map(chrys => {
              const scale = 1 + Math.sin(chrys.pulse) * 0.2;
              return (
                <g key={chrys.id} transform={`translate(${chrys.x},${chrys.y}) scale(${scale})`}>
                  <path d="M0 -10 Q5 -5 10 0 Q5 5 0 0 Z" fill="#a855f7" stroke="none" />
                  <rect x="-2" y="0" width="4" height="15" fill="#a855f7" />
                </g>
              );
            })}
          </g>

          {/* Butterflies */}
          <g>
            {butterflies.map(b => (
              <g key={b.id} transform={`translate(${b.x},${b.y}) rotate(${b.wingAngle})`}>
                <path d="M0 0 Q-10 -10 -20 0 Q-10 10 0 0 Q10 10 20 0 Q10 -10 0 0" fill="#f43f5e" stroke="none" />
                <circle cx="0" cy="0" r="2" fill="white" />
              </g>
            ))}
          </g>

          {/* Layer 5: In-situ HUD */}
          <g className="text-sm text-muted-foreground">
            <text x="50" y="50">Eggs: {eggs.filter(e => !e.hatched).length}</text>
            <text x="50" y="70">Larvae: {caterpillars.length}</text>
            <text x="50" y="90">Pupae: {chrysalides.length}</text>
            <text x="50" y="110">Adults: {butterflies.length}</text>
          </g>
        </svg>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium mb-1">Temperature</label>
            <div className="flex items-center">
              <input
                type="range"
                min={15}
                max={35}
                step={1}
                value={temperature}
                onChange={e => setTemperature(Number(e.target.value))}
                className="w-full"
              />
              <span className="ml-2 w-10 text-center">{temperature}°C</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Food Availability</label>
            <div className="flex items-center">
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={foodAvailability}
                onChange={e => setFoodAvailability(Number(e.target.value))}
                className="w-full"
              />
              <span className="ml-2 w-10 text-center">{foodAvailability.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Predation Risk</label>
            <div className="flex items-center">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={predationRisk}
                onChange={e => setPredationRisk(Number(e.target.value))}
                className="w-full"
              />
              <span className="ml-2 w-10 text-center">{predationRisk.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Initial Egg Count</label>
            <div className="flex items-center">
              <input
                type="range"
                min={10}
                max={200}
                step={10}
                value={initialEggCount}
                onChange={e => setInitialEggCount(Number(e.target.value))}
                className="w-full"
              />
              <span className="ml-2 w-10 text-center">{initialEggCount}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-3">
          <button
            onClick={togglePlay}
            className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg transition-colors"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {educationalCards.map(card => (
          <div key={card.step} className="p-4 bg-muted border rounded-lg">
            <h3 className="font-medium text-primary">{card.title}</h3>
            <p className="text-sm text-muted-foreground">{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
