import React, { useState, useMemo, useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function DopplerEffectSoundSourceMotionSimulation() {
  const [sourceFrequency, setSourceFrequency] = useState(440);
  const [soundSpeed, setSoundSpeed] = useState(343);
  const [sourceVelocity, setSourceVelocity] = useState(0);

  const observedFrequency = useMemo(() => {
    const denominator = soundSpeed - sourceVelocity;
    if (denominator <= 0) return sourceFrequency * 10;
    return sourceFrequency * (soundSpeed / denominator);
  }, [sourceFrequency, soundSpeed, sourceVelocity]);

  const wavelengthOriginal = useMemo(() => soundSpeed / sourceFrequency, [soundSpeed, sourceFrequency]);
  const wavelengthObserved = useMemo(() => (soundSpeed - sourceVelocity) / sourceFrequency, [soundSpeed, sourceVelocity, sourceFrequency]);
  const waveSpeedCheck = useMemo(() => observedFrequency * wavelengthObserved, [observedFrequency, wavelengthObserved]);
  const frequencyShift = useMemo(() => observedFrequency - sourceFrequency, [observedFrequency, sourceFrequency]);
  const compressionRatio = useMemo(() => wavelengthObserved / wavelengthOriginal, [wavelengthObserved, wavelengthOriginal]);

  const waveRadiusRef = useRef(0);
  const waveFrontsRef = useRef(null);
  const observerGlowRef = useRef(null);
  const frequencyWaveRef = useRef(null);
  const soundSourceRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(waveRadiusRef, {
        waveRadius: 400,
        duration: 4,
        ease: "none",
        repeat: -1,
        onUpdate: () => {}
      });

      const pulseObserver = () => {
        gsap.to(observerGlowRef.current, {
          attr: { r: 18 },
          duration: 0.5,
          yoyo: true,
          repeat: -1,
          ease: "power1.inOut"
        });
      };
      pulseObserver();

      const animateFrequencyWave = () => {
        const path = frequencyWaveRef.current;
        if (!path) return;
        const length = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 1 / observedFrequency, repeat: -1, ease: "none" }
        );
      };
      animateFrequencyWave();

      gsap.ticker.add(() => {
        if (waveFrontsRef.current) {
          waveFrontsRef.current.setAttribute("d", generateWavefrontsPath());
        }
        if (frequencyWaveRef.current) {
          frequencyWaveRef.current.setAttribute("d", generateFrequencyWavePath());
        }
      });
    }, document.getElementById("svg-container"));

    return () => ctx.revert();
  }, [observedFrequency, sourceVelocity, sourceFrequency, soundSpeed]);

  const generateWavefrontsPath = () => {
    const waves = 8;
    const baseRadius = sourceVelocity >= 0 ? wavelengthObserved : wavelengthOriginal;
    let d = "";
    for (let n = 1; n <= waves; n++) {
      const radius = n * baseRadius + waveRadiusRef.waveRadius % baseRadius;
      const cx = 200;
      const cy = 240;
      d += `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy} `;
    }
    return d;
  };

  const generateFrequencyWavePath = () => {
    const points = [];
    const amplitude = 20;
    const waveLength = 600;
    const period = 1 / observedFrequency;
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const x = 200 + (i / steps) * waveLength;
      const y = 240 + amplitude * Math.sin((2 * Math.PI * observedFrequency * (i / steps)) * period * 1000);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(" L ")}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-sans">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-primary">Doppler Effect: Moving Sound Source and Observed Frequency Shift</h1>
        <p className="text-muted-foreground">Visualize how motion compresses/stretches sound waves, shifting perceived frequency</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <div className="p-3 bg-muted rounded border">
          <div className="font-medium">Observed Frequency (f')</div>
          <div className="mt-1 text-2xl font-bold">{observedFrequency.toFixed(1)} <span className="text-muted-foreground">Hz</span></div>
        </div>
        <div className="p-3 bg-muted rounded border">
          <div className="font-medium">Original Wavelength (λ0)</div>
          <div className="mt-1 text-2xl font-bold">{wavelengthOriginal.toFixed(3)} <span className="text-muted-foreground">m</span></div>
        </div>
        <div className="p-3 bg-muted rounded border">
          <div className="font-medium">Observed Wavelength (λ')</div>
          <div className="mt-1 text-2xl font-bold">{wavelengthObserved.toFixed(3)} <span className="text-muted-foreground">m</span></div>
        </div>
        <div className="p-3 bg-muted rounded border">
          <div className="font-medium">Wave Speed Check (f'λ)</div>
          <div className="mt-1 text-2xl font-bold">{waveSpeedCheck.toFixed(1)} <span className="text-muted-foreground">m/s</span></div>
        </div>
        <div className="p-3 bg-muted rounded border">
          <div className="font-medium">Frequency Shift Δf</div>
          <div className="mt-1 text-2xl font-bold">{frequencyShift.toFixed(1)} <span className="text-muted-foreground">Hz</span></div>
        </div>
        <div className="p-3 bg-muted rounded border">
          <div className="font-medium">Wavelength Compression Ratio</div>
          <div className="mt-1 text-2xl font-bold">{compressionRatio.toFixed(3)} <span className="text-muted-foreground">ratio</span></div>
        </div>
      </div>

      <div className="relative w-full h-[500px] min-h-[500px] bg-background rounded-xl overflow-hidden border">
        <svg id="svg-container" className="w-full h-full" viewBox="0 0 960 480" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="observerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={accentColors.primary} stopOpacity="0.6" />
              <stop offset="100%" stopColor={accentColors.primary} stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={accentColors.primary} floodOpacity="0.5" />
            </filter>
          </defs>

          <g ref={soundSourceRef}>
            <path d="M 180 220 l 40 0 l 20 20 l -40 0 z" fill={accentColors.secondary}
            />
          </g>

          <g ref={waveFrontsRef}>
            <path stroke={accentColors.primary} strokeWidth="2" fill="none" strokeDasharray="4,2"
            />
          </g>

          <circle ref={observerGlowRef} cx="800" cy="240" r="12" fill={accentColors.secondary} filter="url(#glow)"
          />

          <path ref={frequencyWaveRef} stroke={accentColors.accent} strokeWidth="1.5" fill="none" filter="url(#glow)"
          />

          <line x1="150" y1="100" x2="250" y2="100" stroke={accentColors.primary} strokeWidth="2" markerStart="url(#arrowhead)" markerEnd="url(#arrowhead)"
          />
          <text x="200" y="90" textAnchor="middle" fill={accentColors.primary} fontSize="12">
            λ₀: {wavelengthOriginal.toFixed(2)} m
          </text>
          <line x1="650" y1="100" x2="750" y2="100" stroke={accentColors.primary} strokeWidth="2" markerStart="url(#arrowhead)" markerEnd="url(#arrowhead)"
          />
          <text x="700" y="90" textAnchor="middle" fill={accentColors.primary} fontSize="12">
            λ': {wavelengthObserved.toFixed(2)} m
          </text>
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">Source Frequency (fs)</label>
          <input
            type="range"
            min={100}
            max={1000}
            step={10}
            value={sourceFrequency}
            onChange={(e) => setSourceFrequency(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100 Hz</span>
            <span>1000 Hz</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Speed of Sound (v)</label>
          <input
            type="range"
            min={300}
            max={350}
            step={1}
            value={soundSpeed}
            onChange={(e) => setSoundSpeed(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>300 m/s</span>
            <span>350 m/s</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Source Velocity (vs, + = toward observer)</label>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={sourceVelocity}
            onChange={(e) => setSourceVelocity(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-50 m/s</span>
            <span>+50 m/s</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            setSourceFrequency(440);
            setSoundSpeed(343);
            setSourceVelocity(0);
          }}
          className="px-4 py-2 bg-muted rounded hover:bg-muted/80 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      <div className="space-y-4">
        {pedagogicalCallouts.map((callout, idx) => (
          <div key={idx} className="p-4 bg-muted rounded border">
            <h3 className="font-semibold mb-2">{callout.title}</h3>
            <p className="text-sm">{callout.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const accentColors = {
  primary: "#38bdf8",
  secondary: "#f43f5e",
  accent: "#34d399",
};

const pedagogicalCallouts = [
  {
    step: 1,
    title: "Stationary Source: Symmetric Wavefronts",
    text: "When the sound source is stationary (vs = 0), wavefronts are evenly spaced circles. The observer detects the same frequency as the source. Wavelength and frequency obey v = fλ."
  },
  {
    step: 2,
    title: "Source Moving Toward Observer: Wavefront Compression",
    text: "As the source moves toward the observer, each successive wavefront is emitted from a position closer to the observer. This compresses the wavelength in front of the source (increasing observed frequency) and stretches it behind (decreasing frequency behind)."
  },
  {
    step: 3,
    title: "Observer Perspective: Higher Pitch Detected",
    text: "The stationary observer encounters wavefronts more frequently due to the reduced spacing (λ' < λ). This results in a higher perceived pitch (blueshift). The wave speed in the medium remains unchanged."
  },
  {
    step: 4,
    title: "Source Moving Away: Wavefront Stretch and Redshift",
    text: "When the source recedes, wavefronts are stretched behind it (λ' > λ), leading to fewer wavefronts reaching the observer per second—a lower perceived pitch (redshift). The Doppler formula adjusts sign accordingly."
  }
];
