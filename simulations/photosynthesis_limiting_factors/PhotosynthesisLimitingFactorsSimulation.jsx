import React, { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function PhotosynthesisLimitingFactorsSimulation() {
  const [lightIntensityPct, setLightIntensityPct] = useState(70);
  const [co2ConcentrationPpm, setCo2ConcentrationPpm] = useState(450);
  const [temperatureC, setTemperatureC] = useState(26);
  const [waterAvailabilityPct, setWaterAvailabilityPct] = useState(85);
  const [lightWavelengthMode, setLightWavelengthMode] = useState('full_spectrum');

  const {
    spectralAbsorptionEfficiency,
    effectiveLightFlux,
    stomatalApertureUm,
    internalCo2CiPpm,
    temperatureKineticFactor,
    lightDependentRate,
    lightIndependentCalvinRate,
    netPhotosyntheticRateUmol,
    o2EvolutionMlHr,
    glucoseSynthesisMgHr,
    rubiscoCarboxylationEfficiencyPct,
    limitingFactorLabel
  } = useMemo(() => {
    const spectralAbsorptionEfficiency = lightWavelengthMode === 'red_blue' ? 0.96 : 
      lightWavelengthMode === 'green' ? 0.18 : 0.82;
    const effectiveLightFlux = lightIntensityPct * spectralAbsorptionEfficiency;
    const stomatalApertureUm = Math.max(1.0, (waterAvailabilityPct / 100) * (temperatureC > 38 ? 0.35 : 1.0) * 12.0);
    const internalCo2CiPpm = co2ConcentrationPpm * (stomatalApertureUm / 12.0) * 0.72;
    const temperatureKineticFactor = Math.max(0.05, Math.exp(-Math.pow(temperatureC - 28.5, 2) / (temperatureC < 28.5 ? 180 : 75)));
    const lightDependentRate = (100 * effectiveLightFlux) / (effectiveLightFlux + 32);
    const lightIndependentCalvinRate = (100 * internalCo2CiPpm) / (internalCo2CiPpm + 180);
    const netPhotosyntheticRateUmol = Math.min(lightDependentRate, lightIndependentCalvinRate) * temperatureKineticFactor * (waterAvailabilityPct > 20 ? 1.0 : 0.4);
    const o2EvolutionMlHr = netPhotosyntheticRateUmol * 0.48;
    const glucoseSynthesisMgHr = netPhotosyntheticRateUmol * 0.36;
    const rubiscoCarboxylationEfficiencyPct = Math.min(100, Math.max(5, temperatureKineticFactor * (internalCo2CiPpm / (internalCo2CiPpm + 120)) * 100));
    const limitingFactorLabel = temperatureC < 14 ? 'Low Temperature (Kinetic Slowdown)' : 
      (temperatureC > 38 ? 'High Temperature (Thermal Denaturation)' : 
        (waterAvailabilityPct < 35 ? 'Water Deficit (Stomatal Closure)' : 
          (lightDependentRate < lightIndependentCalvinRate ? 'Light Intensity (Photon Flux)' : 'Carbon Dioxide (RuBisCO Substrate)')));

    return {
      spectralAbsorptionEfficiency,
      effectiveLightFlux,
      stomatalApertureUm,
      internalCo2CiPpm,
      temperatureKineticFactor,
      lightDependentRate,
      lightIndependentCalvinRate,
      netPhotosyntheticRateUmol,
      o2EvolutionMlHr,
      glucoseSynthesisMgHr,
      rubiscoCarboxylationEfficiencyPct,
      limitingFactorLabel
    };
  }, [lightIntensityPct, co2ConcentrationPpm, temperatureC, waterAvailabilityPct, lightWavelengthMode]);

  const particleRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const createParticles = () => {
      const particles = [];
      for (let i = 0; i < 40; i++) {
        const type = Math.floor(Math.random() * 4);
        let x, y, vx, vy, radius, color;
        switch (type) {
          case 0: // photons
            x = Math.random() * 960;
            y = -10;
            vx = (Math.random() - 0.5) * 0.5;
            vy = 2 + Math.random() * 3;
            radius = 2;
            color = lightWavelengthMode === 'red_blue' ? 
              (Math.random() > 0.5 ? '#ff0000' : '#0000ff') : 
              lightWavelengthMode === 'green' ? '#00ff00' : '#ffff00';
            break;
          case 1: // water
            x = 480 + Math.random() * 40;
            y = 200 + Math.random() * 80;
            vx = (Math.random() - 0.5) * 0.2;
            vy = -0.5 - Math.random() * 1;
            radius = 1.5;
            color = '#add8e6';
            break;
          case 2: // CO2
            x = 50 + Math.random() * 100;
            y = 420 + Math.random() * 20;
            vx = 0.5 + Math.random() * 1;
            vy = (Math.random() - 0.5) * 0.2;
            radius = 1.8;
            color = '#a9a9a9';
            break;
          case 3: // O2
            x = 400 + Math.random() * 160;
            y = 100 + Math.random() * 100;
            vx = (Math.random() - 0.5) * 0.5;
            vy = -0.3 - Math.random() * 0.7;
            radius = 2;
            color = '#00ffff';
            break;
        }
        particles.push({ id: i, type, x, y, vx, vy, radius, color, life: 1 });
      }
      return particles;
    };

    const initParticles = createParticles();
    particleRef.current = initParticles;

    const tick = (time, delta) => {
      const particles = particleRef.current.map(p => {
        let { x, y, vx, vy, type } = p;
        x += vx * delta * 60;
        y += vy * delta * 60;

        switch (type) {
          case 0: // photons
            if (y > 480) { y = -10; x = Math.random() * 960; }
            break;
          case 1: // water
            if (y < 0) { y = 200 + Math.random() * 80; x = 480 + Math.random() * 40; }
            if (x > 960) { x = 480; y = 200 + Math.random() * 80; }
            break;
          case 2: // CO2
            if (x > 960) { x = 50; y = 420 + Math.random() * 20; }
            if (y < 0) { y = 420; x = 50 + Math.random() * 100; }
            break;
          case 3: // O2
            if (y < 0) { y = 100 + Math.random() * 100; x = 400 + Math.random() * 160; }
            if (x > 960) { x = 400; y = 100 + Math.random() * 100; }
            break;
        }
        return { ...p, x, y };
      });
      particleRef.current = particles;
    };

    const animator = gsap.ticker.add(tick);
    
      
      
      
      
      return () => gsap.ticker.remove(animator);
  }, [lightWavelengthMode]);

  const telemetryMetrics = [
    { id: 'photosynthetic_rate', label: 'Net Photosynthetic Rate', value: netPhotosyntheticRateUmol.toFixed(1), unit: 'μmol/m²/s' },
    { id: 'limiting_factor', label: 'Active Limiting Factor', value: limitingFactorLabel, unit: "Blackman's Law" },
    { id: 'stomatal_aperture', label: 'Stomatal Pore Aperture', value: stomatalApertureUm.toFixed(1), unit: 'μm' },
    { id: 'rubisco_activity', label: 'RuBisCO Carboxylation Rate', value: rubiscoCarboxylationEfficiencyPct.toFixed(1), unit: '% Optimal' },
    { id: 'o2_evolution', label: 'O₂ Gas Evolution Rate', value: o2EvolutionMlHr.toFixed(1), unit: 'mL/hr' },
    { id: 'glucose_synthesis', label: 'Hexose Sugar Production', value: glucoseSynthesisMgHr.toFixed(1), unit: 'mg/hr' }
  ];

  const educationalCards = [
    {
      title: "Blackman's Law of Limiting Factors (1905)",
      content: "Proposed by British plant physiologist F.F. Blackman, this fundamental bio-energetic law states that when a physiological process is conditioned by several separate factors (such as light, CO2, and temperature), its overall rate is strictly governed by the slowest factor that is in shortest supply."
    },
    {
      title: "Light Intensity & the Thylakoid Photolysis Limit",
      content: "In the light-dependent reactions within thylakoid membranes, chlorophyll a and b absorb photons to excite electrons in Photosystem II (P680) and Photosystem I (P700), splitting water into O2, protons, and reducing power (ATP and NADPH). At low light, photon arrival limits the process; beyond the light saturation point, the Calvin cycle becomes the bottleneck."
    },
    {
      title: "RuBisCO Enzyme Kinetics & Carbon Fixation",
      content: "The enzyme Ribulose-1,5-bisphosphate carboxylase-oxygenase (RuBisCO) catalyzes the initial fixation of atmospheric CO2 into 3-phosphoglycerate inside the chloroplast stroma. Atmospheric CO2 (~420 ppm) is sub-saturating for C3 plants; enriching CO2 up to 800-1000 ppm accelerates carboxylation and suppresses wasteful photorespiration."
    },
    {
      title: "Thermal Denaturation & Stomatal Transpiration",
      content: "Photosynthetic enzymes exhibit an optimum temperature (typically 25-32°C). Below this, molecular kinetic energy is low; above 40°C, thermal denaturation destabilizes RuBisCO and membrane fluidity collapses. Concurrently, high heat and low soil moisture trigger abscisic acid (ABA), closing stomata to prevent dehydration, which starves the leaf of CO2."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">Photosynthesis Dynamics & Biochemical Limiting Factors Simulation</h1>
        <p className="text-gray-400">Exploring how light intensity, wavelength, CO₂ concentration, temperature, and water availability govern photosynthetic rate via Blackman's Law</p>
        <div className="mt-2 px-4 py-1 bg-gray-800/50 rounded-full inline-flex items-center">
          <span className="mr-2">Current Regime:</span>
          <span className="font-semibold">{limitingFactorLabel}</span>
        </div>
      </header>

      <div className="grid gap-4 mb-6">
        {telemetryMetrics.map((metric, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-3 text-center">
            <h3 className="font-medium text-gray-300">{metric.label}</h3>
            <div className="flex justify-between mt-2">
              <span>{metric.value}</span>
              <span className="text-gray-400">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative w-full min-h-[500px] h-[500px] bg-gray-900/50 rounded-xl overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 960 480" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87ceeb" />
              <stop offset="100%" stopColor="#4682b4" />
            </linearGradient>
            <linearGradient id="chloroplastGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#228b22" />
              <stop offset="100%" stopColor="#006400" />
            </linearGradient>
            <radialGradient id="stomataGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b4513" />
              <stop offset="100%" stopColor="#654321" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
              <feMerge>
                <feMergeNode in="offsetBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Layer 1: Environment Grid */}
          <g stroke="#2a2a2a" strokeWidth="0.5" opacity="0.3">
            {[...Array(49)].map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 10} x2="960" y2={i * 10} />
            ))}
            {[...Array(97)].map((_, i) => (
              <line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="480" />
            ))}
          </g>

          {/* Layer 2: Leaf Cross-Section (Physical Enclosure) */}
          <g>
            {/* Leaf Outline */}
            <path d="M50 400 
                     C30 350, 30 250, 50 200 
                     C70 150, 130 120, 200 100 
                     C270 80, 350 80, 420 100 
                     C490 120, 550 150, 570 200 
                     C590 250, 590 350, 570 400 
                     C550 450, 490 480, 420 480 
                     C350 480, 270 450, 200 400 
                     C130 350, 70 320, 50 400 Z" fill="#228b22" opacity="0.8"/>

            {/* Upper Epidermis */}
            <path d="M50 200 
                     C70 180, 130 160, 200 150 
                     C270 140, 350 140, 420 150 
                     C490 160, 550 180, 570 200 
                     L570 202 
                     C550 182, 490 160, 420 150 
                     C350 140, 270 140, 200 150 
                     C130 160, 70 182, 50 202 Z" fill="#006400" opacity="0.9"/>

            {/* Palisade Mesophyll */}
            <rect x="200" y="150" width="370" height="100" fill="url(#chloroplastGrad)" opacity="0.7"/>

            {/* Spongy Mesophyll */}
            <path d="M200 250 
                     C180 280, 180 350, 200 380 
                     C220 410, 280 420, 320 400 
                     C360 380, 420 350, 440 300 
                     C460 250, 420 220, 380 200 
                     C340 180, 280 180, 240 200 
                     C200 220, 200 240, 200 250 Z" fill="#32cd32" opacity="0.6"/>

            {/* Vascular Bundle (Xylem) */}
            <rect x="380" y="180" width="40" height="220" fill="url(#waterGrad)" rx="5"/>

            {/* Stomatal Pore */}
            <g transform={`translate(300, 420)`}>
              <ellipse cx={0} cy={0} rx={stomatalApertureUm/2} ry={6} fill="#8b4513"/>
              <path d={`M${-stomatalApertureUm/2} -6 
                       C${-stomatalApertureUm/2 - 5} -12, ${stomatalApertureUm/2 + 5} -12, ${stomatalApertureUm/2} -6`} fill="#654321"/>
              <path d={`M${stomatalApertureUm/2} -6 
                       C${stomatalApertureUm/2 + 5} -12, ${-stomatalApertureUm/2 - 5} -12, ${-stomatalApertureUm/2} -6`} fill="#654321"/>
            </g>

            {/* Chloroplast Inset */}
            <g transform="translate(750, 250) scale(0.8)">
              <circle cx="0" cy="0" r="60" fill="#006400" opacity="0.2" stroke="#228b22" strokeWidth="2"/>
              <circle cx="0" cy="0" r="50" fill="none" stroke="#006400" strokeWidth="3" strokeDasharray="5,5"/>
              <circle cx="0" cy="0" r="30" fill="url(#chloroplastGrad)" opacity="0.3"/>
              {[...Array(5)].map((_, i) => (
                <rect key={i} x={-25} y={-10 + i*5} width="50" height="3" fill="#228b22" rx="1.5"/>
              ))}
            </g>
          </g>

          {/* Layer 4: Particle Dynamics */}
          <g>
            {particleRef.current.map(p => (
              <circle key={p.id} cx={p.x} cy={p.y} r={p.radius} fill={p.color} filter={p.type === 0 || p.type === 3 ? "url(#glow)" : "none"} opacity={p.type === 0 ? 0.8 : p.type === 3 ? 0.7 : 0.6}/>
            ))}
          </g>

          {/* Layer 5: In-Situ HUD (Limiting Factor Label & Mini-Graph) */}
          <g transform="translate(750, 50)">
            {/* Limiting Factor Label */}
            <rect x="0" y="0" width="200" height="20" fill="#ff4500" opacity="0.2"/>
            <text x="10" y="15" fontSize="12" fill="#ff4500">⚠️</text>
            <text x="30" y="15" fontSize="12" fill="#ffa500">{limitingFactorLabel.split(' ')[0]}</text>

            {/* Mini-Graph: Photosynthetic Rate vs Light Intensity */}
            <rect x="0" y="20" width="180" height="100" fill="none" stroke="#555" strokeWidth="1"/>
            {/* Axes */}
            <line x1="20" y1="110" x2="180" y2="110" stroke="#777" strokeWidth="0.5"/>
            <line x1="20" y1="20" x2="20" y2="110" stroke="#777" strokeWidth="0.5"/>
            {/* Labels */}
            <text x="100" y="125" fontSize="10" textAnchor="middle" fill="#aaa">Light Intensity (%)</text>
            <text x="5" y="65" fontSize="10" textAnchor="middle" transform="rotate(-90 5,65)" fill="#aaa">Photosynthetic Rate</text>
            {/* Curve */}
            <path 
              d={[
                'M20 110',
                ...[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(i => {
                  const eff = (i/100) * spectralAbsorptionEfficiency;
                  const lightDep = (100 * eff) / (eff + 32);
                  const tempFact = temperatureKineticFactor;
                  const waterFact = waterAvailabilityPct > 20 ? 1.0 : 0.4;
                  const rate = Math.min(lightDep, lightIndependentCalvinRate) * tempFact * waterFact;
                  const y = 110 - (rate / 100) * 90;
                  const x = 20 + (i/100) * 160;
                  return `${x} ${y}`;
                })
              ].join(' ')}
              fill="none"
              stroke="#00ff00"
              strokeWidth="2"
            />
            {/* Current Point */}
            <circle cx={20 + (lightIntensityPct/100) * 160} cy={110 - (netPhotosyntheticRateUmol / 100) * 90} r="4" fill="#ff0" filter="url(#glow)"
            />
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {['light_intensity_pct', 'co2_concentration_ppm', 'temperature_c', 'water_availability_pct', 'light_wavelength_mode'].map(controlId => {
          const control = {
            light_intensity_pct: { label: 'Light Intensity (PAR Flux)', min: 0, max: 100, step: 5, unit: '% Sunlight', value: lightIntensityPct, setValue: setLightIntensityPct },
            co2_concentration_ppm: { label: 'CO₂ Concentration', min: 100, max: 1200, step: 50, unit: 'ppm', value: co2ConcentrationPpm, setValue: setCo2ConcentrationPpm },
            temperature_c: { label: 'Ambient Temperature', min: 5, max: 50, step: 1, unit: '°C', value: temperatureC, setValue: setTemperatureC },
            water_availability_pct: { label: 'Soil Moisture / Water Availability', min: 10, max: 100, step: 5, unit: '% Field Capacity', value: waterAvailabilityPct, setValue: setWaterAvailabilityPct },
            light_wavelength_mode: { label: 'Light Spectrum Wavelength', options: [
              { value: 'full_spectrum', label: 'Full Solar Spectrum (White)' },
              { value: 'red_blue', label: 'Chlorophyll Absorption Peaks (Red 660nm + Blue 430nm)' },
              { value: 'green', label: 'Reflected Green Spectrum (520-550nm - Low Absorption)' }
            ], value: lightWavelengthMode, setValue: setLightWavelengthMode }
          }[controlId];

          if (control.options) {
            return (
              <div key={controlId} className="bg-gray-800/50 rounded-xl p-4">
                <label className="block text-gray-300 mb-2">{control.label}</label>
                <select
                  value={control.value}
                  onChange={(e) => control.setValue(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  {control.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">{control.value}</p>
              </div>
            );
          } else {
            return (
              <div key={controlId} className="bg-gray-800/50 rounded-xl p-4">
                <label className="block text-gray-300 mb-2">{control.label}</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={control.value}
                    onChange={(e) => control.setValue(Number(e.target.value))}
                    className="w-4/5"
                  />
                  <span className="ml-2 w-20 text-center">{control.value}{control.unit}</span>
                </div>
              </div>
            );
          }
        })}
      </div>

      <div className="grid gap-4">
        {educationalCards.map((card, index) => (
          <div key={index} className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            <p className="text-gray-300">{card.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
