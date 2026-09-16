import React, { useState, useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';

export default function NeuroscienceStressBrainAnatomySimulation() {
  const [stressDurationMonths, setStressDurationMonths] = useState(6);
  const [stressorIntensityPct, setStressorIntensityPct] = useState(75);
  const [mindfulnessVagalIntervention, setMindfulnessVagalIntervention] = useState(false);
  const [exerciseBdnfBoost, setExerciseBdnfBoost] = useState(false);

  const containerRef = useRef(null);

  const derivedModel = useMemo(() => {
    const serumCortisol = 10 + 32 * (stressorIntensityPct / 100) * (mindfulnessVagalIntervention ? 0.55 : 1.0);
    const pfcSpineDensity = Math.max(35, 100 - 4.8 * stressDurationMonths * (stressorIntensityPct / 100) + (exerciseBdnfBoost ? 14 : 0));
    const amygdalaHyperactivity = 1.0 + 0.16 * stressDurationMonths + 1.1 * (stressorIntensityPct / 100);
    const hippocampusVolumeRetention = Math.max(72, 100 - 2.6 * stressDurationMonths * (stressorIntensityPct / 100) + (exerciseBdnfBoost ? 8 : 0));
    const hpaFeedbackEfficacy = Math.max(18, 100 - 6.2 * stressDurationMonths);
    const restingHeartRate = 68 + 48 * (stressorIntensityPct / 100) * (stressDurationMonths < 1 ? 1.0 : 0.5) - (mindfulnessVagalIntervention ? 16 : 0);
    const neurogenesisRate = Math.max(150, 1000 - 70 * stressDurationMonths + (exerciseBdnfBoost ? 350 : 0));

    return {
      serumCortisol: serumCortisol.toFixed(1),
      pfcSpineDensity: pfcSpineDensity.toFixed(1),
      amygdalaHyperactivity: amygdalaHyperactivity.toFixed(2),
      hippocampusVolumeRetention: hippocampusVolumeRetention.toFixed(1),
      hpaFeedbackEfficacy: hpaFeedbackEfficacy.toFixed(0),
      restingHeartRate: Math.round(restingHeartRate),
      neurogenesisRate: neurogenesisRate.toFixed(0)
    };
  }, [stressDurationMonths, stressorIntensityPct, mindfulnessVagalIntervention, exerciseBdnfBoost]);

  const telemetryMetrics = [
    { id: 'serum_cortisol', label: 'Serum Cortisol Level', unit: 'μg/dL', precision: 1, value: derivedModel.serumCortisol, max: 50 },
    { id: 'pfc_density', label: 'Prefrontal Synaptic Density', unit: '%', precision: 1, value: derivedModel.pfcSpineDensity, max: 100 },
    { id: 'amygdala_activity', label: 'Amygdala Hyperactivity', unit: 'x Baseline', precision: 2, value: derivedModel.amygdalaHyperactivity, max: 4 },
    { id: 'hippocampus_volume', label: 'Hippocampus Volume Retention', unit: '%', precision: 1, value: derivedModel.hippocampusVolumeRetention, max: 100 },
    { id: 'hpa_feedback', label: 'HPA Negative Feedback Loop', unit: '% Efficacy', precision: 0, value: derivedModel.hpaFeedbackEfficacy, max: 100 },
    { id: 'heart_rate', label: 'Resting Heart Rate', unit: 'BPM', precision: 0, value: derivedModel.restingHeartRate, max: 120 }
  ];

  const educationalCards = [
    {
      title: 'The HPA Axis: Threat Detection to Hormonal Flood',
      content: 'When sensory cortices detect a threat, the Amygdala signals the Hypothalamus to release Corticotropin-Releasing Hormone (CRH). This triggers the Anterior Pituitary to secrete ACTH into the blood, causing the adrenal cortex to produce Cortisol and Adrenaline, preparing the body for fight-or-flight.'
    },
    {
      title: 'Prefrontal Cortex Atrophy & Executive Dysfunction',
      content: 'The Prefrontal Cortex (PFC) governs working memory, decision-making, and impulse control. Chronic cortisol floods cause dendritic spine retraction and synaptic pruning in PFC pyramidal neurons, resulting in brain fog, cognitive rigidity, and impaired emotional regulation.'
    },
    {
      title: 'Amygdala Hypertrophy: The Fear Feedback Loop',
      content: 'Unlike the PFC and Hippocampus which shrink, neurons in the Basolateral Amygdala undergo dendritic hypertrophy - sprouting new connections and growing larger under chronic stress. This locks the individual into a perpetual state of hyper-vigilance, panic, and anxiety.'
    },
    {
      title: 'Hippocampal Glucocorticoid Toxicity & Neurogenesis',
      content: 'The Hippocampus contains the highest concentration of glucocorticoid receptors and serves as the brake that signals the hypothalamus to shut off cortisol. Chronic cortisol damages CA3 neurons and suppresses new neuron generation (neurogenesis) in the dentate gyrus, breaking the brake and locking the HPA axis on.'
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.crh-particle', {
        x: '+=60',
        y: '+=10',
        duration: 1.8,
        repeat: -1,
        stagger: 0.3,
        ease: 'power1.inOut',
        yoyo: true
      });
      gsap.to('.acth-particle', {
        x: '+=80',
        y: '-=8',
        duration: 2.2,
        repeat: -1,
        stagger: 0.25,
        ease: 'sine.inOut',
        yoyo: true
      });
      gsap.to('.cortisol-particle', {
        x: '-=70',
        y: '+=15',
        duration: 2.5,
        repeat: -1,
        stagger: 0.4,
        ease: 'power2.inOut',
        yoyo: true
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const amygdalaScale = Math.min(1.4, 0.8 + parseFloat(derivedModel.amygdalaHyperactivity) * 0.15);
  const pfcOpacity = Math.max(0.4, parseFloat(derivedModel.pfcSpineDensity) / 100);
  const hippoOpacity = Math.max(0.45, parseFloat(derivedModel.hippocampusVolumeRetention) / 100);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#070a13] text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. Header with dynamic status badge */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
                Physical Neuro-Anatomy & Cellular Stress Remodeling
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Interactive physical simulation of HPA-axis cascade, Amygdala hypertrophy, and Synaptic pruning
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/80 border border-indigo-700/50 text-indigo-300">
              {stressDurationMonths === 0 ? 'Acute Stress (15 min)' : stressDurationMonths <= 3 ? 'Sub-Acute (1-3 Mo)' : 'Chronic Neuro-Toxicity (>6 Mo)'}
            </span>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${mindfulnessVagalIntervention ? 'bg-emerald-950/80 border-emerald-700/50 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
              {mindfulnessVagalIntervention ? 'Vagal Brake Active' : 'Sympathetic Tone High'}
            </span>
          </div>
        </header>

        {/* 2. Telemetry HUD Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {telemetryMetrics.map((metric) => {
            const pct = Math.min(100, Math.max(0, (parseFloat(metric.value) / metric.max) * 100));
            return (
              <div key={metric.id} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 shadow-lg backdrop-blur flex flex-col justify-between">
                <div className="text-xs text-slate-400 truncate">{metric.label}</div>
                <div className="my-1.5 flex items-baseline justify-between">
                  <span className="text-lg font-bold tracking-tight text-white">{metric.value}</span>
                  <span className="text-[11px] text-slate-500">{metric.unit}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </section>

        {/* 3. Dedicated Simulation Stage (Framed SVG with authentic anatomical contours) */}
        <section className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Sagittal Neuro-Anatomical Cross-Section & Endocrine Streams
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#667eea]" /> PFC</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#fa709a]" /> Amygdala</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" /> Hippocampus</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f093fb]" /> Hypothalamus/Pituitary</span>
            </div>
          </div>

          <svg className="w-full h-[400px] rounded-xl bg-[#0a0f1d]" viewBox="0 0 940 450">
            <defs>
              <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.75" />
              </linearGradient>
              <radialGradient id="cortexNucleusGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </radialGradient>
              <radialGradient id="hippocampusGradient" cx="50%" cy="50%" r="40%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </radialGradient>
              <radialGradient id="amygdalaGradient" cx="50%" cy="50%" r="40%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d48" />
              </radialGradient>
              <linearGradient id="hpaStreamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Cranial & Ventricular Background Silhouette */}
            <path
              d="M 120 280 C 70 240, 60 140, 160 80 C 260 20, 520 20, 660 70 C 780 120, 830 200, 800 290 C 780 340, 710 380, 640 370 C 580 360, 540 390, 520 420 C 490 420, 480 360, 450 330 C 400 320, 250 340, 180 330 Z"
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="2"
              opacity="0.6"
            />

            {/* Authentic Sagittal Brain Contours with Multi-Point Bezier Lobes */}
            <g className="brain-structures">
              
              {/* Prefrontal Cortex (Anterior Lobe) with Sulcal Folds */}
              <g style={{ opacity: pfcOpacity, transition: 'opacity 0.4s' }}>
                <path
                  d="M 160 260 C 130 220, 110 160, 170 110 C 230 60, 300 80, 340 120 C 320 160, 310 200, 260 240 C 220 270, 180 280, 160 260 Z"
                  fill="url(#brainGradient)"
                  stroke="#6366f1"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                {/* Sulci / Gyri Natural Fissures */}
                <path d="M 180 140 C 210 170, 240 150, 280 170" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 160 190 C 190 210, 220 190, 250 210" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
                <text x="180" y="105" fill="#a5b4fc" fontSize="12" fontWeight="600">Prefrontal Cortex</text>
                <text x="180" y="120" fill="#64748b" fontSize="10">Synaptic Density: {derivedModel.pfcSpineDensity}%</text>
              </g>

              {/* Central Hypothalamus (HPA Origin) */}
              <g>
                <path
                  d="M 440 240 C 460 220, 490 220, 510 240 C 510 260, 480 270, 450 265 Z"
                  fill="url(#cortexNucleusGradient)"
                  stroke="#f472b6"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                />
                {/* Pituitary Gland stalk and bulb */}
                <path d="M 470 265 L 470 295" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
                <circle cx="470" cy="305" r="9" fill="#db2777" stroke="#fbcfe8" strokeWidth="1.5" filter="url(#glow)" />
                <text x="430" y="215" fill="#f472b6" fontSize="11" fontWeight="600">Hypothalamus</text>
                <text x="485" y="310" fill="#fbcfe8" fontSize="10">Pituitary</text>
              </g>

              {/* Hippocampus (Memory Consolidation & Glucocorticoid Brake) */}
              <g style={{ opacity: hippoOpacity, transition: 'opacity 0.4s' }}>
                <path
                  d="M 520 220 C 580 190, 640 210, 660 260 C 640 280, 590 270, 550 250 C 530 240, 520 230, 520 220 Z"
                  fill="url(#hippocampusGradient)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                />
                <text x="560" y="200" fill="#38bdf8" fontSize="11" fontWeight="600">Hippocampus (CA3/DG)</text>
                <text x="560" y="214" fill="#64748b" fontSize="10">Vol. Retained: {derivedModel.hippocampusVolumeRetention}%</text>
              </g>

              {/* Amygdala (Threat Hub - Hypertrophies under stress) */}
              <g transform={`translate(480, 275) scale(${amygdalaScale}) translate(-480, -275)`}>
                <path
                  d="M 460 270 C 475 255, 500 255, 515 270 C 525 285, 505 305, 485 305 C 465 305, 450 285, 460 270 Z"
                  fill="url(#amygdalaGradient)"
                  stroke="#fb7185"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                <text x="525" y="285" fill="#fb7185" fontSize="11" fontWeight="700">Amygdala (+{derivedModel.amygdalaHyperactivity}x)</text>
              </g>

              {/* Neural Signaling Tracts with dynamic hormonal particles */}
              <path
                d="M 320 190 C 400 170, 450 220, 480 255"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.5"
              />
              <path
                d="M 500 275 C 550 290, 600 270, 580 240"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.6"
              />

              {/* Animated Endocrine Streams (CRH / ACTH / Cortisol) */}
              {[0, 1, 2].map((i) => (
                <circle
                  key={`crh-${i}`}
                  className="crh-particle"
                  cx={455 + i * 8}
                  cy={250 + i * 10}
                  r="3"
                  fill="#f43f5e"
                  filter="url(#glow)"
                />
              ))}
              {[0, 1, 2, 3].map((i) => (
                <circle
                  key={`acth-${i}`}
                  className="acth-particle"
                  cx={470 + i * 6}
                  cy={305 + i * 8}
                  r="3"
                  fill="#fb923c"
                  filter="url(#glow)"
                />
              ))}
              {[0, 1, 2].map((i) => (
                <circle
                  key={`cort-${i}`}
                  className="cortisol-particle"
                  cx={620 - i * 15}
                  cy={240 - i * 10}
                  r="3.5"
                  fill="#facc15"
                  filter="url(#glow)"
                />
              ))}
            </g>

            {/* Inset Microscope: Cellular Dendritic Spine Micrograph */}
            <g transform="translate(710, 40)">
              <rect x="0" y="0" width="200" height="170" rx="12" fill="#030712" stroke="#334155" strokeWidth="1.5" />
              <text x="12" y="22" fill="#94a3b8" fontSize="11" fontWeight="700">CELLULAR SPINE INSET</text>
              <text x="12" y="36" fill="#64748b" fontSize="9">PFC Pyramidal Dendritic Shaft</text>

              {/* Dendrite Trunk */}
              <path d="M 30 140 C 60 110, 120 100, 170 70" fill="none" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
              
              {/* Spines that shrink / retract with chronic cortisol */}
              <g style={{ opacity: pfcOpacity }}>
                {/* Mushroom spine 1 */}
                <path d="M 65 110 L 60 85" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="60" cy="82" r="5" fill="#38bdf8" filter="url(#glow)" />
                {/* Mushroom spine 2 */}
                <path d="M 105 95 L 115 70" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="116" cy="67" r="4.5" fill="#38bdf8" filter="url(#glow)" />
                {/* Thin spine */}
                <path d="M 135 85 L 145 60" stroke="#818cf8" strokeWidth="1.5" />
                <circle cx="146" cy="58" r="3" fill="#818cf8" />
              </g>

              {/* Atrophy warning banner */}
              <text x="12" y="155" fill={pfcOpacity < 0.6 ? '#f43f5e' : '#10b981'} fontSize="10" fontWeight="600">
                {pfcOpacity < 0.6 ? '⚠ Severe Dendritic Pruning' : '✓ Synaptic Spine Arbor Intact'}
              </text>
            </g>
          </svg>
        </section>

        {/* 4. Interactive Control Deck Grid */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Interactive Physiological Controls
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Slider 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Stress Exposure Duration</span>
                <span className="text-indigo-400 font-semibold">{stressDurationMonths} Months</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={stressDurationMonths}
                onChange={(e) => setStressDurationMonths(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[11px] text-slate-500 block">0 = Acute (15 min), 12 = Chronic (1 Yr)</span>
            </div>

            {/* Slider 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Stressor / Threat Intensity</span>
                <span className="text-rose-400 font-semibold">{stressorIntensityPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={stressorIntensityPct}
                onChange={(e) => setStressorIntensityPct(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className="text-[11px] text-slate-500 block">Threat severity & HPA drive</span>
            </div>

            {/* Toggle 1 */}
            <div className="flex flex-col justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-xs font-medium text-slate-300">Mindfulness & Vagal Breathing</span>
              <button
                type="button"
                onClick={() => setMindfulnessVagalIntervention(!mindfulnessVagalIntervention)}
                className={`mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${mindfulnessVagalIntervention ? 'bg-emerald-600 text-white shadow-emerald-900/40 shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {mindfulnessVagalIntervention ? '✓ Vagal Brake Active (-45% Cortisol)' : 'Disabled'}
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex flex-col justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-xs font-medium text-slate-300">Aerobic Exercise (BDNF Boost)</span>
              <button
                type="button"
                onClick={() => setExerciseBdnfBoost(!exerciseBdnfBoost)}
                className={`mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${exerciseBdnfBoost ? 'bg-cyan-600 text-white shadow-cyan-900/40 shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {exerciseBdnfBoost ? '✓ Neurogenesis +350 Cells/Day' : 'Disabled'}
              </button>
            </div>
          </div>
        </section>

        {/* 5. Educational Theory Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {educationalCards.map((card, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-200 mb-2">{card.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{card.content}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}
