function StomachAcidDigestionSimulation() {
  // State variables for physiological and biochemical parameters
  const [gastricPh, setGastricPh] = useState(1.8);
  const [hclSecretionRate, setHclSecretionRate] = useState(25); // mmol/hr
  const [pepsinogenOutput, setPepsinogenOutput] = useState(60); // mg/hr
  const [peristalsisSpeed, setPeristalsisSpeed] = useState(3.0); // cycles/min
  const [mucusThickness, setMucusThickness] = useState(0.6); // mm
  const [proteinSubstrateLoad, setProteinSubstrateLoad] = useState(100); // grams
  const [isPlaying, setIsPlaying] = useState(true);

  // SVG and Animation Refs
  const stomachContourRef = useRef(null);
  const chymePoolRef = useRef(null);
  const acidDropsGroupRef = useRef(null);
  const pylorusRef = useRef(null);
  const timelineRef = useRef(null);

  // Derived Biochemical Calculations
  const protonConcentration = useMemo(() => {
    return Math.pow(10, -gastricPh) * 1000; // mM
  }, [gastricPh]);

  // Pepsinogen to Pepsin conversion efficiency (active at pH < 3.5, optimal at pH 1.5 - 2.0)
  const pepsinActivationEfficiency = useMemo(() => {
    if (gastricPh <= 2.0) return 0.98;
    if (gastricPh >= 5.0) return 0.02;
    return Math.max(0.05, 1 - (gastricPh - 2.0) / 3.0);
  }, [gastricPh]);

  const activePepsinConcentration = useMemo(() => {
    return (pepsinogenOutput * pepsinActivationEfficiency).toFixed(1);
  }, [pepsinogenOutput, pepsinActivationEfficiency]);

  // Michaelis-Menten rate of protein hydrolysis: v = (Vmax * [S]) / (Km + [S])
  const proteolysisRate = useMemo(() => {
    const vmax = parseFloat(activePepsinConcentration) * 1.5;
    const km = 25; // mg/mL
    const rate = (vmax * proteinSubstrateLoad) / (km + proteinSubstrateLoad);
    return rate.toFixed(1);
  }, [activePepsinConcentration, proteinSubstrateLoad]);

  // Chyme Viscosity / Homogenization progress
  const chymeBreakdownScore = useMemo(() => {
    const mechanicalFactor = peristalsisSpeed / 5.0;
    const chemicalFactor = parseFloat(proteolysisRate) / 80.0;
    return Math.min(100, Math.round((mechanicalFactor * 0.4 + chemicalFactor * 0.6) * 100));
  }, [peristalsisSpeed, proteolysisRate]);

  // Mucosal barrier safety margin vs acid corrosion
  const mucosalSafetyStatus = useMemo(() => {
    const acidStress = (4.0 - gastricPh) * 25; // 0 to 75
    const defenseScore = mucusThickness * 100; // 10 to 100
    const margin = defenseScore - acidStress;
    if (margin > 30) return { label: "Protected", color: "#34d399", desc: "Bicarbonate-mucus gel barrier intact" };
    if (margin > 0) return { label: "Acid Stress", color: "#fbbf24", desc: "Mild mucosal erosion risk" };
    return { label: "Epithelial Risk", color: "#f87171", desc: "Ulcerative susceptibility high" };
  }, [gastricPh, mucusThickness]);

  // GSAP Peristaltic Churning Animation
  useEffect(() => {
    if (!stomachContourRef.current || !chymePoolRef.current) return;

    timelineRef.current = gsap.timeline({ repeat: -1, yoyo: true });

    const duration = Math.max(0.6, 3.5 / peristalsisSpeed);

    timelineRef.current
      .to(stomachContourRef.current, {
        scaleY: 1.04,
        scaleX: 0.98,
        duration: duration,
        ease: "sine.inOut",
      })
      .to(chymePoolRef.current, {
        scaleY: 0.96,
        scaleX: 1.03,
        duration: duration,
        ease: "sine.inOut",
      }, 0);

    if (!isPlaying) {
      timelineRef.current.pause();
    }

    return () => {
      timelineRef.current?.kill();
    };
  }, [peristalsisSpeed, isPlaying]);

  const resetToDefaults = () => {
    setGastricPh(1.8);
    setHclSecretionRate(25);
    setPepsinogenOutput(60);
    setPeristalsisSpeed(3.0);
    setMucusThickness(0.6);
    setProteinSubstrateLoad(100);
    setIsPlaying(true);
  };

  const telemetryMetrics = [
    { label: "Gastric Lumen pH", value: gastricPh.toFixed(2), unit: "pH" },
    { label: "Active Pepsin Output", value: activePepsinConcentration, unit: "mg/hr" },
    { label: "Proteolysis Rate", value: proteolysisRate, unit: "mg/min" },
    { label: "Chyme Digestion Index", value: `${chymeBreakdownScore}%`, unit: "hydrolyzed" },
    { label: "H+ Ion Concentration", value: protonConcentration.toFixed(1), unit: "mM [H+]" },
    { label: "Mucosal Barrier Status", value: mucosalSafetyStatus.label, unit: mucosalSafetyStatus.desc },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-5 font-sans select-none">
      {/* Simulation Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Stomach Gastric Acid Digestion & Enzyme Dynamics
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-400">
              Biochemistry & Physiology
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time modeling of parietal cell HCl secretion, pepsinogen autolytic cleavage, and gastric chyme proteolysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1.5 rounded-full border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-white transition-colors flex items-center gap-1.5"
          >
            <span>{isPlaying ? "⏸ Pause Churning" : "▶ Resume Churning"}</span>
          </button>
          <button
            onClick={resetToDefaults}
            className="px-3.5 py-1.5 rounded-full border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Telemetry HUD Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {telemetryMetrics.map((m, i) => (
          <div key={i} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">{m.label}</span>
            <span className="text-lg font-bold text-white my-1 font-mono tracking-tight">{m.value}</span>
            <span className="text-[10px] text-neutral-400 truncate">{m.unit}</span>
          </div>
        ))}
      </div>

      {/* Main Visual Stage: Gastric Anatomy & Proteolysis Kinetics */}
      <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 mb-5 relative flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 900 420"
          className="w-full h-auto max-h-[380px]"
          style={{ transformOrigin: "center center" }}
        >
          <defs>
            {/* Acid Pool Gradient based on pH */}
            <linearGradient id="chymeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={gastricPh < 2.5 ? "#f59e0b" : "#84cc16"} stopOpacity="0.8" />
              <stop offset="100%" stopColor={gastricPh < 2.5 ? "#d97706" : "#4d7c0f"} stopOpacity="0.9" />
            </linearGradient>

            {/* Mucosal protective barrier layer */}
            <linearGradient id="mucusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.6" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Grid Lines */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#171717" strokeWidth="0.8" />
          </pattern>
          <rect width="900" height="420" fill="url(#grid)" />

          {/* Esophagus (Entry) */}
          <path d="M 280,30 L 320,30 L 340,110 L 300,110 Z" fill="#262626" stroke="#404040" strokeWidth="2" />
          <text x="310" y="25" textAnchor="middle" fill="#737373" fontSize="11" fontFamily="monospace">Esophagus</text>

          {/* Duodenum (Exit) */}
          <path d="M 640,290 C 720,290 760,340 760,390 L 720,390 C 720,350 680,320 640,320 Z" fill="#262626" stroke="#404040" strokeWidth="2" />
          <text x="750" y="410" textAnchor="middle" fill="#737373" fontSize="11" fontFamily="monospace">Duodenum →</text>

          {/* Outer Gastric Wall (Fundus, Greater Curvature, Antrum) */}
          <g ref={stomachContourRef} style={{ transformOrigin: "460px 230px" }}>
            <path
              d="M 300,110 C 230,120 180,180 180,250 C 180,340 250,380 380,380 C 510,380 620,340 640,290 L 640,320 C 600,360 480,400 360,400 C 210,400 150,340 150,240 C 150,160 210,90 300,80 Z"
              fill="#141414"
              stroke="#2e2e2e"
              strokeWidth="2.5"
            />

            {/* Protective Mucus Gel Layer (Thickness responsive) */}
            <path
              d="M 310,120 C 245,130 195,190 195,250 C 195,330 260,365 380,365 C 490,365 590,330 630,285"
              fill="none"
              stroke="url(#mucusGradient)"
              strokeWidth={Math.max(2, mucusThickness * 10)}
              strokeLinecap="round"
            />

            {/* Chyme Digestion Pool */}
            <path
              ref={chymePoolRef}
              d="M 210,250 C 210,330 270,360 380,360 C 490,360 580,320 620,280 C 560,260 460,240 370,240 C 290,240 240,250 210,250 Z"
              fill="url(#chymeGradient)"
              filter="url(#glow)"
            />

            {/* Peristaltic Wave Arrows */}
            <g stroke="#ffffff" strokeWidth="1.5" opacity="0.6">
              <path d="M 330,280 C 370,300 410,300 450,285" fill="none" strokeDasharray="4 3" />
              <path d="M 480,295 C 520,305 560,300 590,285" fill="none" strokeDasharray="4 3" />
            </g>
          </g>

          {/* Parietal Cell Secretion Vector (HCl) */}
          <g transform="translate(200, 150)">
            <circle cx="0" cy="0" r="14" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="bold">H+ / Cl-</text>
            <text x="0" y="-18" textAnchor="middle" fill="#93c5fd" fontSize="9" fontFamily="monospace">Parietal Cell</text>
            {/* Animated Secretion Droplets */}
            <circle cx="15" cy="20" r="3.5" fill="#f59e0b" opacity="0.8" />
            <circle cx="28" cy="40" r="3" fill="#f59e0b" opacity="0.6" />
          </g>

          {/* Chief Cell Secretion Vector (Pepsinogen) */}
          <g transform="translate(180, 260)">
            <circle cx="0" cy="0" r="14" fill="#a855f7" fillOpacity="0.2" stroke="#a855f7" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#c084fc" fontSize="8" fontWeight="bold">Pepsin</text>
            <text x="-5" y="-18" textAnchor="middle" fill="#d8b4fe" fontSize="9" fontFamily="monospace">Chief Cell</text>
            <circle cx="25" cy="15" r="3" fill="#a855f7" opacity="0.7" />
            <circle cx="45" cy="25" r="3.5" fill="#a855f7" opacity="0.5" />
          </g>

          {/* Pyloric Sphincter Valve */}
          <g transform="translate(635, 290)">
            <rect x="-6" y="-15" width="12" height="30" rx="3" fill="#404040" stroke="#737373" strokeWidth="1" />
            <text x="0" y="-22" textAnchor="middle" fill="#a3a3a3" fontSize="9" fontFamily="monospace">Pylorus Valve</text>
          </g>

          {/* In-Situ Biochemical Annotation Labels */}
          <g transform="translate(380, 160)">
            <rect x="-110" y="-25" width="220" height="50" rx="8" fill="#0a0a0a" stroke="#262626" strokeWidth="1" />
            <text x="0" y="-8" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
              Pepsinogen + HCl → Active Pepsin
            </text>
            <text x="0" y="12" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace">
              Optimal Activity @ pH 1.5 - 2.0
            </text>
          </g>
        </svg>
      </div>

      {/* Interactive Sliders & Parameter Tuning Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
        {/* Slider 1: Gastric pH */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400 font-medium">Gastric Lumen pH</span>
            <span className="font-mono text-white font-semibold">{gastricPh.toFixed(1)} pH</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={gastricPh}
            onChange={(e) => setGastricPh(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>1.0 (Highly Acidic)</span>
            <span>2.0 (Normal)</span>
            <span>5.0 (Hypochlorhydria)</span>
          </div>
        </div>

        {/* Slider 2: HCl Secretion Rate */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400 font-medium">Parietal HCl Secretion</span>
            <span className="font-mono text-white font-semibold">{hclSecretionRate} mmol/hr</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={hclSecretionRate}
            onChange={(e) => setHclSecretionRate(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>5 (Basal)</span>
            <span>25 (Postprandial)</span>
            <span>50 (Max Stim)</span>
          </div>
        </div>

        {/* Slider 3: Pepsinogen Output */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400 font-medium">Chief Cell Pepsinogen</span>
            <span className="font-mono text-white font-semibold">{pepsinogenOutput} mg/hr</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={pepsinogenOutput}
            onChange={(e) => setPepsinogenOutput(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>10 mg/hr</span>
            <span>60 mg/hr</span>
            <span>120 mg/hr</span>
          </div>
        </div>

        {/* Slider 4: Peristaltic Speed */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400 font-medium">Peristaltic Churning Rate</span>
            <span className="font-mono text-white font-semibold">{peristalsisSpeed.toFixed(1)} cpm</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.5"
            value={peristalsisSpeed}
            onChange={(e) => setPeristalsisSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>1.0 (Atony)</span>
            <span>3.0 (Normal)</span>
            <span>5.0 (Hyper)</span>
          </div>
        </div>

        {/* Slider 5: Mucus Gel Thickness */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400 font-medium">Mucus Gel Barrier</span>
            <span className="font-mono text-white font-semibold">{mucusThickness.toFixed(2)} mm</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={mucusThickness}
            onChange={(e) => setMucusThickness(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>0.1 mm (Thin/NSAID)</span>
            <span>0.6 mm (Normal)</span>
            <span>1.0 mm (Thick)</span>
          </div>
        </div>

        {/* Slider 6: Ingested Protein Meal Load */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400 font-medium">Protein Substrate Load</span>
            <span className="font-mono text-white font-semibold">{proteinSubstrateLoad} g</span>
          </div>
          <input
            type="range"
            min="20"
            max="200"
            step="10"
            value={proteinSubstrateLoad}
            onChange={(e) => setProteinSubstrateLoad(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>20 g (Light snack)</span>
            <span>100 g (Meal)</span>
            <span>200 g (Feast)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
