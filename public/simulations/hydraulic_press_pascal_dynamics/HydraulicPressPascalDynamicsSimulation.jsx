import React, { useState, useMemo, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HydraulicPressPascalDynamicsSimulation() {
  const [d1_mm, setD1] = useState(25);
  const [d2_mm, setD2] = useState(200);
  const [F1_N, setF1] = useState(500);
  const [rho_kg_m3, setRho] = useState(870);
  const [mu_Pa_s, setMu] = useState(0.046);
  const [Q_L_min, setQ] = useState(10);
  const [stroke_mm, setStroke] = useState(150);
  const [efficiency, setEff] = useState(0.92);
  const [sim_time_s, setSimTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  const scopeRef = useRef(null);
  const piston1Ref = useRef(null);
  const piston2Ref = useRef(null);
  const ramRef = useRef(null);
  const workpieceRef = useRef(null);
  const gaugeNeedleRef = useRef(null);
  const pumpGearRef = useRef(null);
  const waveRingsRef = useRef([]);
  const fluidParticlesRef = useRef([]);
  const ctxRef = useRef(null);

  const derived = useMemo(() => {
    const A1_m2 = Math.PI * Math.pow(d1_mm * 1e-3 / 2, 2);
    const A2_m2 = Math.PI * Math.pow(d2_mm * 1e-3 / 2, 2);
    const area_ratio = A2_m2 / A1_m2;
    const P_Pa = F1_N / A1_m2;
    const F2_ideal_N = F1_N * area_ratio;
    const F2_actual_N = F2_ideal_N * efficiency;
    const Q_m3_s = Q_L_min * 1e-3 / 60;
    const v1_m_s = Q_m3_s / A1_m2;
    const v2_m_s = Q_m3_s / A2_m2;
    const x1_m = sim_time_s * v1_m_s;
    const x2_m = sim_time_s * v2_m_s;
    const x1_mm = x1_m * 1000;
    const x2_mm = x2_m * 1000;
    const work_in_J = F1_N * x1_m;
    const work_out_J = F2_actual_N * x2_m;
    const power_W = F1_N * v1_m_s;
    const reynolds = rho_kg_m3 * v2_m_s * (d2_mm * 1e-3) / mu_Pa_s;
    const pressure_bar = P_Pa / 1e5;
    const force_multiplication = F2_actual_N / F1_N;
    const stroke_complete = x2_mm >= stroke_mm ? 1 : 0;
    return { A1_m2, A2_m2, area_ratio, P_Pa, F2_ideal_N, F2_actual_N, Q_m3_s, v1_m_s, v2_m_s, x1_m, x2_m, x1_mm, x2_mm, work_in_J, work_out_J, power_W, reynolds, pressure_bar, force_multiplication, stroke_complete };
  }, [d1_mm, d2_mm, F1_N, rho_kg_m3, mu_Pa_s, Q_L_min, stroke_mm, efficiency, sim_time_s]);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 24; i++) {
      const inManifold = i < 12;
      const yBase = inManifold ? 220 : 220;
      const xStart = inManifold ? 180 + (i % 12) * 45 : 500 + (i % 12) * 25;
      arr.push({
        id: i,
        x: xStart,
        y: yBase + (Math.random() - 0.5) * 20,
        vx: inManifold ? derived.v1_m_s * 1000 : derived.v2_m_s * 1000,
        vy: (Math.random() - 0.5) * 10,
        r: 2 + Math.random() * 2,
        inManifold,
        phase: Math.random() * Math.PI * 2
      });
    }
    return arr;
  }, [derived.v1_m_s, derived.v2_m_s]);

  const waveRings = useMemo(() => [
    { id: 0, x: 320, y: 220, delay: 0 },
    { id: 1, x: 320, y: 220, delay: 0.2 },
    { id: 2, x: 320, y: 220, delay: 0.4 },
    { id: 3, x: 320, y: 220, delay: 0.6 }
  ], []);

  const gaugePath = useMemo(() => {
    const cx = 120, cy = 120, r = 45;
    const startAngle = -135 * Math.PI / 180;
    const endAngle = 135 * Math.PI / 180;
    const sweep = endAngle - startAngle;
    const pressure = Math.min(derived.pressure_bar, 400);
    const needleAngle = startAngle + (pressure / 400) * sweep;
    return { cx, cy, r, needleAngle, startAngle, endAngle };
  }, [derived.pressure_bar]);

  const fluidGrad1 = useMemo(() => ({
    stops: [
      { offset: '0%', color: '#1e3a5f' },
      { offset: '50%', color: '#0ea5e9' },
      { offset: '100%', color: '#38bdf8' }
    ]
  }), []);

  const fluidGrad2 = useMemo(() => ({
    stops: [
      { offset: '0%', color: '#1e3a5f' },
      { offset: '50%', color: '#0ea5e9' },
      { offset: '100%', color: '#38bdf8' }
    ]
  }), []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pumpGearRef.current) {
        gsap.to(pumpGearRef.current, {
          rotation: 360 * derived.Q_m3_s * 100,
          duration: 1,
          ease: 'none',
          repeat: -1,
          transformOrigin: 'center'
        });
      }
      waveRings.forEach((ring, i) => {
        const el = waveRingsRef.current[i];
        if (el) {
          gsap.fromTo(el, 
            { scale: 0, opacity: 0.6 },
            { scale: 2.5, opacity: 0, duration: 1.2, repeat: -1, delay: ring.delay, ease: 'power1.out' }
          );
        }
      });
      if (piston1Ref.current) {
        gsap.to(piston1Ref.current, {
          y: -Math.min(derived.x1_mm, 180),
          duration: 0.1,
          ease: 'none'
        });
      }
      if (ramRef.current) {
        gsap.to(ramRef.current, {
          y: -Math.min(derived.x2_mm, stroke_mm),
          duration: 0.1,
          ease: 'none'
        });
      }
      if (workpieceRef.current && derived.x2_mm > 0) {
        const compression = Math.min(0.15, derived.x2_mm / stroke_mm * 0.15);
        gsap.to(workpieceRef.current, {
          scaleX: 1 - compression,
          transformOrigin: 'center',
          duration: 0.1,
          ease: 'none'
        });
      }
      if (gaugeNeedleRef.current) {
        gsap.to(gaugeNeedleRef.current, {
          rotation: gaugePath.needleAngle * 180 / Math.PI + 135,
          duration: 0.3,
          ease: 'power2.out',
          transformOrigin: 'center'
        });
      }
      particles.forEach((p, i) => {
        const el = fluidParticlesRef.current[i];
        if (el) {
          const targetX = p.inManifold ? p.x + p.vx * 0.1 : p.x + p.vx * 0.1;
          gsap.to(el, {
            x: targetX,
            y: p.y + Math.sin(Date.now() * 0.005 + p.phase) * 5,
            duration: 0.1,
            ease: 'none',
            onComplete: () => {
              if (p.inManifold && targetX > 580) {
                gsap.set(el, { x: 180 });
              } else if (!p.inManifold && targetX > 880) {
                gsap.set(el, { x: 500 });
              }
            }
          });
        }
      });
    }, scopeRef);
    ctxRef.current = ctx;
    return () => ctx.revert();
  }, [derived, particles, stroke_mm, gaugePath.needleAngle]);

  useEffect(() => {
    if (!isPlaying) return;
    const tick = () => {
      setSimTime(t => t + 0.016 * speed);
    };
    gsap.ticker.add(tick);
    
      
      return () => gsap.ticker.remove(tick);
  }, [isPlaying, speed]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setD1(25); setD2(200); setF1(500); setRho(870); setMu(0.046);
    setQ(10); setStroke(150); setEff(0.92); setSimTime(0); setIsPlaying(true); setSpeed(1);
  };
  const handleStep = () => setSimTime(t => t + 0.1);
  const handleFastForward = () => setSpeed(s => s === 1 ? 5 : s === 5 ? 10 : 1);

  const telemetryMetrics = [
    { label: 'System Pressure', value: derived.pressure_bar.toFixed(1), unit: 'bar' },
    { label: 'Output Force', value: (derived.F2_actual_N / 1000).toFixed(2), unit: 'kN' },
    { label: 'Force Multiplication', value: derived.force_multiplication.toFixed(1), unit: '×' },
    { label: 'Ram Velocity', value: (derived.v2_m_s * 1000).toFixed(1), unit: 'mm/s' },
    { label: 'Hydraulic Power', value: (derived.power_W / 1000).toFixed(2), unit: 'kW' },
    { label: 'Work Efficiency', value: (derived.work_out_J / Math.max(0.001, derived.work_in_J) * 100).toFixed(1), unit: '%' },
    { label: 'Reynolds Number', value: Math.round(derived.reynolds).toString(), unit: '' },
    { label: 'Stroke Progress', value: Math.min(100, derived.x2_mm / stroke_mm * 100).toFixed(1), unit: '%' }
  ];

  const educationalCards = [
    { step: 1, title: "Pascal's Principle Activated", text: "Pressure applied to the small input piston (F\u2081/A\u2081) transmits undiminished through the incompressible hydraulic fluid to the large output piston. Observe the pressure gauge \u2014 it reads identically at both cylinders regardless of diameter." },
    { step: 2, title: "Force Multiplication in Action", text: "The output force F\u2082 = F\u2081 \u00d7 (A\u2082/A\u2081) = F\u2081 \u00d7 (d\u2082/d\u2081)\u00b2. With d\u2081=25mm and d\u2082=200mm, area ratio = 64\u00d7. Your 500 N input becomes 32 kN output (minus losses). Watch the force badges update live as you adjust diameters." },
    { step: 3, title: "Energy Conservation \u2014 The Displacement Trade-off", text: "Volume conservation demands A\u2081\u00b7x\u2081 = A\u2082\u00b7x\u2082. The ram moves only 1/64th the distance of the input piston. Work in = Work out (ideal): F\u2081\u00b7x\u2081 = F\u2082\u00b7x\u2082. Power P = F\u2081\u00b7v\u2081 = F\u2082\u00b7v\u2082 remains constant. Adjust flow rate Q to see velocity scaling." },
    { step: 4, title: "Real-World Losses & Dynamic Effects", text: "Efficiency \u03b7 < 1.0 captures seal friction, fluid compressibility, and leakage. Viscosity \u03bc creates pressure drop \u0394P = 32\u03bcLv/d\u00b2 in lines. Reynolds number indicates flow regime \u2014 keep Re < 2300 for laminar. At high cycle rates, fluid inertia and water hammer appear." }
  ];

  const sliderConfig = [
    { id: 'd1', label: 'Input Piston \u00d8', value: d1_mm, set: setD1, min: 10, max: 100, step: 1, unit: 'mm' },
    { id: 'd2', label: 'Output Piston \u00d8', value: d2_mm, set: setD2, min: 50, max: 500, step: 5, unit: 'mm' },
    { id: 'F1', label: 'Input Force', value: F1_N, set: setF1, min: 50, max: 5000, step: 50, unit: 'N' },
    { id: 'Q', label: 'Pump Flow Rate', value: Q_L_min, set: setQ, min: 1, max: 100, step: 1, unit: 'L/min' },
    { id: 'rho', label: 'Fluid Density', value: rho_kg_m3, set: setRho, min: 800, max: 1200, step: 10, unit: 'kg/m\u00b3' },
    { id: 'mu', label: 'Viscosity', value: mu_Pa_s, set: setMu, min: 0.01, max: 0.2, step: 0.005, unit: 'Pa\u00b7s' },
    { id: 'stroke', label: 'Ram Stroke', value: stroke_mm, set: setStroke, min: 20, max: 500, step: 10, unit: 'mm' },
    { id: 'eff', label: 'Efficiency', value: efficiency, set: setEff, min: 0.7, max: 1.0, step: 0.01, unit: '' }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-mono" style={{ background: '#0a0e17' }}>
      <style jsx global>{`
        .slider-track { -webkit-appearance: none; appearance: none; background: linear-gradient(90deg, #1e3a5f, #0ea5e9); height: 6px; border-radius: 3px; outline: none; }
        .slider-track::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; background: #38bdf8; border-radius: 50%; cursor: pointer; box-shadow: 0 0 8px rgba(56,189,248,0.6); border: 2px solid #0a0e17; }
        .slider-track::-moz-range-thumb { width: 18px; height: 18px; background: #38bdf8; border-radius: 50%; cursor: pointer; border: 2px solid #0a0e17; box-shadow: 0 0 8px rgba(56,189,248,0.6); }
        .glass-card { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); border: 1px solid rgba(55, 65, 81, 0.6); border-radius: 12px; }
        .btn-primary { background: linear-gradient(135deg, #0ea5e9, #38bdf8); color: #0a0e17; font-weight: 600; padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { box-shadow: 0 0 20px rgba(56,189,248,0.5); transform: translateY(-1px); }
        .btn-secondary { background: rgba(55, 65, 81, 0.8); color: #f1f5f9; border: 1px solid #374151; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: rgba(75, 85, 99, 0.9); border-color: #4b5563; }
      `}</style>

      <header className="px-6 py-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Hydraulic Press Pascal Dynamics
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Force Multiplication & Fluid Power \u2014 Interactive Pascal's Law Laboratory</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-mono ${isPlaying ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
              {isPlaying ? 'RUNNING' : 'PAUSED'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {speed}x SPEED
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
              P = {derived.pressure_bar.toFixed(1)} bar
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3" aria-label="Telemetry HUD">
          {telemetryMetrics.map((m, i) => (
            <div key={i} className="glass-card p-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{m.label}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold tabular-nums text-sky-300">{m.value}</span>
                <span className="text-sm text-slate-500">{m.unit}</span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500" style={{ width: `${Math.min(100, parseFloat(m.value) / (m.label.includes('Pressure') ? 400 : m.label.includes('Force') ? 500 : m.label.includes('Multiplication') ? 100 : m.label.includes('Velocity') ? 500 : m.label.includes('Power') ? 10 : m.label.includes('Efficiency') ? 100 : m.label.includes('Reynolds') ? 3000 : 100)) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </section>

        <section className="glass-card p-4 overflow-hidden" style={{ minHeight: '500px', height: '500px' }} aria-label="Simulation Stage">
          <svg ref={scopeRef} viewBox="0 0 960 480" className="w-full h-full" style={{ background: '#0a0e17' }}>
            <defs>
              <filter id="fluidTurbulence" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#374151" />
                <stop offset="50%" stopColor="#1f2937" />
                <stop offset="100%" stopColor="#111827" />
              </linearGradient>
              <linearGradient id="pistonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e5e7eb" />
                <stop offset="50%" stopColor="#f3f4f6" />
                <stop offset="100%" stopColor="#d1d5db" />
              </linearGradient>
              <radialGradient id="fluidGrad1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="60%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#38bdf8" />
              </radialGradient>
              <radialGradient id="fluidGrad2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="60%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#38bdf8" />
              </radialGradient>
              <radialGradient id="gaugeGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </radialGradient>
              <linearGradient id="workpieceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b7280" />
                <stop offset="50%" stopColor="#4b5563" />
                <stop offset="100%" stopColor="#374151" />
              </linearGradient>
              <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.4" />
              </pattern>
              <pattern id="boltPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="3" fill="#374151" />
              </pattern>
            </defs>

            <rect width="960" height="480" fill="url(#gridPattern)" />

            <g filter="url(#glow)">
              <path d="M60,80 C60,40 120,20 180,20 L780,20 C840,20 900,40 900,80 L900,400 C900,440 840,460 780,460 L180,460 C120,460 60,440 60,400 Z" fill="url(#frameGrad)" stroke="#4b5563" strokeWidth="2"
              />
              <path d="M60,80 L60,400" stroke="#4b5563" strokeWidth="1" opacity="0.3"
              />
              <path d="M900,80 L900,400" stroke="#4b5563" strokeWidth="1" opacity="0.3"
              />
              <rect x="180" y="350" width="600" height="50" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="3" />
              <rect x="180" y="355" width="600" height="40" fill="url(#boltPattern)" opacity="0.3" />
              <g stroke="#4b5563" strokeWidth="1" opacity="0.3">
                <line x1="200" y1="350" x2="200" y2="400" />
                <line x1="400" y1="350" x2="400" y2="400" />
                <line x1="600" y1="350" x2="600" y2="400" />
                <line x1="780" y1="350" x2="780" y2="400" />
              </g>
              <circle cx="100" cy="430" r="12" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
              <circle cx="860" cy="430" r="12" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
              <circle cx="100" cy="50" r="12" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
              <circle cx="860" cy="50" r="12" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
            </g>

            <g filter="url(#fluidTurbulence)">
              <rect x="80" y="100" width={d1_mm * 2} height="200" rx={d1_mm} fill="url(#fluidGrad1)" stroke="#0ea5e9" strokeWidth="1" opacity="0.9" />
              <rect x="780" y="100" width={d2_mm * 2} height="200" rx={d2_mm} fill="url(#fluidGrad2)" stroke="#0ea5e9" strokeWidth="1" opacity="0.9" />
              <path d="M180,220 L320,220 Q350,220 350,250 L350,350 Q350,380 320,380 L180,380 Z" fill="#1e3a5f" stroke="#0ea5e9" strokeWidth="1" opacity="0.7" strokeDasharray="8,4" style={{ strokeDashoffset: -sim_time_s * 50 }}
              />
              <path d="M580,220 L780,220" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="8,4" style={{ strokeDashoffset: -sim_time_s * 50 }} opacity="0.6"
              />
            </g>

            <g ref={piston1Ref} transform="translate(180, 300)">
              <rect x={-d1_mm} y={-20} width={d1_mm * 2} height="20" fill="url(#pistonGrad)" stroke="#9ca3af" strokeWidth="1" rx={2} />
              <rect x={-d1_mm * 0.6} y={-120} width={d1_mm * 1.2} height="100" fill="url(#pistonGrad)" stroke="#9ca3af" strokeWidth="1" rx={2} />
              <circle cx={0} cy={-70} r={8} fill="#374151" stroke="#6b7280" strokeWidth="1" />
            </g>

            <g ref={ramRef} transform="translate(880, 300)">
              <rect x={-d2_mm} y={-20} width={d2_mm * 2} height="20" fill="url(#pistonGrad)" stroke="#9ca3af" strokeWidth="1" rx={3} />
              <rect x={-d2_mm * 0.8} y={-180} width={d2_mm * 1.6} height="160" fill="url(#pistonGrad)" stroke="#9ca3af" strokeWidth="1" rx={3} />
              <rect x={-d2_mm * 0.9} y={-180} width={d2_mm * 1.8} height="10" fill="#1f2937" stroke="#374151" strokeWidth="1" />
            </g>

            <g ref={workpieceRef} transform="translate(880, 120)">
              <rect x={-d2_mm * 0.7} y={0} width={d2_mm * 1.4} height="60" fill="url(#workpieceGrad)" stroke="#4b5563" strokeWidth="2" rx={3} />
              <g stroke="#6b7280" strokeWidth="1" opacity="0.5">
                <line x1={-d2_mm * 0.7} y1={15} x2={d2_mm * 0.7} y2={15} />
                <line x1={-d2_mm * 0.7} y1={30} x2={d2_mm * 0.7} y2={30} />
                <line x1={-d2_mm * 0.7} y1={45} x2={d2_mm * 0.7} y2={45} />
              </g>
            </g>

            <g ref={pumpGearRef} transform="translate(180, 220)">
              <circle r="30" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
              <g stroke="#6b7280" strokeWidth="3" strokeLinecap="round">
                <line x1="0" y1="-25" x2="0" y2="-35" />
                <line x1="0" y1="25" x2="0" y2="35" />
                <line x1="-25" y1="0" x2="-35" y2="0" />
                <line x1="25" y1="0" x2="35" y2="0" />
              </g>
              <circle r="8" fill="#374151" stroke="#6b7280" strokeWidth="1" />
            </g>

            {waveRings.map((ring, i) => (
              <circle
                key={ring.id}
                ref={el => waveRingsRef.current[i] = el}
                cx={ring.x}
                cy={ring.y}
                r="15"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                opacity="0"
                transformOrigin="center"
              />
            ))}

            {particles.map((p, i) => (
              <circle
                key={p.id}
                ref={el => fluidParticlesRef.current[i] = el}
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill={p.inManifold ? '#38bdf8' : '#0ea5e9'}
                opacity="0.8"
                filter="url(#glow)"
              />
            ))}

            <g transform="translate(120, 120)">
              <circle cx="0" cy="0" r="50" fill="url(#gaugeGrad)" stroke="#374151" strokeWidth="2" />
              <g stroke="#38bdf8" strokeWidth="1" fontSize="8" fontFamily="mono">
                {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((val, i) => {
                  const angle = -135 + (val / 400) * 270;
                  const rad = angle * Math.PI / 180;
                  const x1 = Math.cos(rad) * 38;
                  const y1 = Math.sin(rad) * 38;
                  const x2 = Math.cos(rad) * 46;
                  const y2 = Math.sin(rad) * 46;
                  const tx = Math.cos(rad) * 52;
                  const ty = Math.sin(rad) * 52;
                  return (
                    <g key={val}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} />
                      <text x={tx} y={ty + 3} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8">{val}</text>
                    </g>
                  );
                })}
              </g>
              <text x="0" y="70" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="bold">BAR</text>
              <line ref={gaugeNeedleRef} x1="0" y1="0" x2="0" y2="-40" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" transformOrigin="0 0"
              />
              <circle cx="0" cy="0" r="6" fill="#f43f5e" stroke="#0a0e17" strokeWidth="2" />
            </g>

            <g fontSize="11" fontFamily="mono" fontWeight="600">
              <text x="180" y="70" textAnchor="middle" fill="#38bdf8" stroke="#0a0e17" strokeWidth="3" paintOrder="stroke">
                F\u2081 = {F1_N} N
              </text>
              <text x="880" y="70" textAnchor="middle" fill="#f43f5e" stroke="#0a0e17" strokeWidth="3" paintOrder="stroke">
                F\u2082 = {(derived.F2_actual_N / 1000).toFixed(1)} kN
              </text>
              <text x="480" y="180" textAnchor="middle" fill="#34d399" stroke="#0a0e17" strokeWidth="3" paintOrder="stroke">
                P = F\u2081/A\u2081 = F\u2082/A\u2082 = {derived.pressure_bar.toFixed(1)} bar
              </text>
              <text x="180" y="430" textAnchor="middle" fill="#fbbf24" stroke="#0a0e17" strokeWidth="3" paintOrder="stroke">
                x\u2081 = {derived.x1_mm.toFixed(1)} mm
              </text>
              <text x="880" y="430" textAnchor="middle" fill="#fbbf24" stroke="#0a0e17" strokeWidth="3" paintOrder="stroke">
                x\u2082 = {derived.x2_mm.toFixed(1)} mm
              </text>
              <text x="920" y="460" textAnchor="end" fill="#f43f5e" stroke="#0a0e17" strokeWidth="3" paintOrder="stroke" fontSize="10">
                P\u2081hyd = {(derived.power_W / 1000).toFixed(2)} kW
              </text>
              <text x="40" y="460" textAnchor="start" fill="#34d399" stroke="#0a0e17" strokeWidth="3" paintOrder="stroke" fontSize="10">
                \u03b7 = {(efficiency * 100).toFixed(0)}%
              </text>
              <rect x="780" y="320" width="4" height={Math.min(180, derived.x2_mm / stroke_mm * 180)} fill="#f43f5e" opacity="0.6" />
              <rect x="780" y="140" width="4" height="180" fill="none" stroke="#374151" strokeWidth="1" strokeDasharray="4,2" />
              <text x="790" y="135" fontSize="8" fill="#94a3b8">STROKE LIMIT</text>
              <text x="790" y={140 + 180 - Math.min(180, derived.x2_mm / stroke_mm * 180)} fontSize="8" fill="#f43f5e" fontWeight="bold">{stroke_mm} mm</text>
            </g>

            <g stroke="#6b7280" strokeWidth="1" opacity="0.3" fontSize="8" fill="#94a3b8">
              {[0, 50, 100, 150, 200, 250, 300, 350, 400].map(y => (
                <g key={y} transform={`translate(40, ${300 - y * 0.4})`}>
                  <line x1="0" y1="0" x2="10" y2="0" />
                  <text x="14" y="3" textAnchor="start">{y}</text>
                </g>
              ))}
              {[0, 50, 100, 150, 200, 250, 300, 350, 400].map(y => (
                <g key={y + 1000} transform={`translate(920, ${300 - y * 0.4})`}>
                  <line x1="-10" y1="0" x2="0" y2="0" />
                  <text x="-14" y="3" textAnchor="end">{y}</text>
                </g>
              ))}
            </g>
          </svg>
        </section>

        <section className="glass-card p-4 space-y-4" aria-label="Control Deck">
          <div className="flex flex-wrap gap-3 mb-2">
            <button onClick={handlePlayPause} className="btn-primary" aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={handleReset} className="btn-secondary">↺ Reset</button>
            <button onClick={handleStep} className="btn-secondary">⏭ Step +0.1s</button>
            <button onClick={handleFastForward} className={`btn-secondary ${speed > 1 ? 'bg-sky-500/20 border-sky-500/30' : ''}`}>
              {speed}x
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sliderConfig.map(cfg => (
              <div key={cfg.id} className="space-y-1">
                <label className="flex justify-between text-xs text-slate-300">
                  <span>{cfg.label}</span>
                  <span className="font-mono tabular-nums text-sky-400">{cfg.value}{cfg.unit}</span>
                </label>
                <input
                  type="range"
                  className="slider-track w-full"
                  min={cfg.min}
                  max={cfg.max}
                  step={cfg.step}
                  value={cfg.value}
                  onChange={e => cfg.set(parseFloat(e.target.value))}
                  aria-label={cfg.label}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Educational Theory">
          {educationalCards.map((card, i) => (
            <div key={i} className="glass-card p-4 border-l-4 border-sky-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-xs font-bold text-sky-400">
                  {card.step}
                </span>
                <h3 className="font-semibold text-sky-300">{card.title}</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{card.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="px-6 py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        Pascal's Law: \u0394P = F\u2081/A\u2081 = F\u2082/A\u2082 | Work Conservation: F\u2081\u00b7x\u2081 = F\u2082\u00b7x\u2082 | Hydraulic Power: P = \u0394P \u00d7 Q
      </footer>
    </div>
  );
}
