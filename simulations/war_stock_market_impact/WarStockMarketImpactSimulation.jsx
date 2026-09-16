import React, { useState, useMemo, useEffect } from "react";

export default function WarStockMarketImpactSimulation() {
  const [escalation_stage, setEscalationStage] = useState(2);
  const [oil_supply_shock_pct, setOilSupplyShockPct] = useState(12);
  const [war_duration_weeks, setWarDurationWeeks] = useState(16);
  const [central_bank_hawkishness_bps, setCentralBankHawkishnessBps] = useState(150);
  const [ceasefire_probability_pct, setCeasefireProbabilityPct] = useState(20);

  const brent_crude_price = useMemo(() => {
    return 75 * (1 + 0.035 * oil_supply_shock_pct) * (1 + 0.14 * escalation_stage);
  }, [oil_supply_shock_pct, escalation_stage]);

  const gold_spot_price = useMemo(() => {
    return 1950 * (1 + 0.11 * escalation_stage) * (1 - 0.05 * (ceasefire_probability_pct / 100));
  }, [escalation_stage, ceasefire_probability_pct]);

  const sp500_index = useMemo(() => {
    const oilPenalty = Math.max(0, brent_crude_price - 75);
    return 4800 * (1 - 0.075 * escalation_stage - 0.003 * oilPenalty) / (1 + 0.00015 * central_bank_hawkishness_bps);
  }, [escalation_stage, brent_crude_price, central_bank_hawkishness_bps]);

  const defense_basket_index = useMemo(() => {
    return 100 * (1 + 0.26 * escalation_stage + 0.004 * war_duration_weeks);
  }, [escalation_stage, war_duration_weeks]);

  const aviation_travel_index = useMemo(() => {
    const oilPenalty = Math.max(0, brent_crude_price - 75);
    return 100 * Math.max(0.3, 1 - 0.16 * escalation_stage - 0.007 * oilPenalty);
  }, [escalation_stage, brent_crude_price]);

  const vix_volatility = useMemo(() => {
    return 14 + 10 * Math.pow(escalation_stage, 1.4) + 0.35 * oil_supply_shock_pct - 7 * (ceasefire_probability_pct / 100);
  }, [escalation_stage, oil_supply_shock_pct, ceasefire_probability_pct]);

  const safe_haven_capital_inflow_b = useMemo(() => {
    return 20 * Math.pow(escalation_stage, 2) + 3 * war_duration_weeks * (1 - ceasefire_probability_pct / 100);
  }, [escalation_stage, war_duration_weeks, ceasefire_probability_pct]);

  const inflation_expectation_pct = useMemo(() => {
    const oilPenalty = Math.max(0, brent_crude_price - 75);
    return 2.1 + 0.08 * oilPenalty + 0.4 * escalation_stage;
  }, [brent_crude_price, escalation_stage]);

  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  const timeSeriesData = useMemo(() => {
    const sp500Series = weeks.map(w => {
      const decayFactor = Math.exp(-w / 20);
      const base = sp500_index * (1 - 0.15 * escalation_stage * decayFactor);
      const noise = (Math.sin(w * 0.3) * 0.02 + Math.random() * 0.01) * base;
      return Math.max(1000, base + noise);
    });
    const defenseSeries = weeks.map(w => {
      const growth = 1 + 0.08 * escalation_stage * (w / 52);
      return defense_basket_index * growth * (1 + (Math.random() * 0.02 - 0.01));
    });
    const brentSeries = weeks.map(w => {
      const shockDecay = Math.exp(-w / 30);
      const base = brent_crude_price * (1 - 0.2 * oil_supply_shock_pct / 100 * shockDecay);
      const noise = (Math.sin(w * 0.15) * 0.01 + Math.random() * 0.005) * base;
      return Math.max(20, base + noise);
    });
    const goldSeries = weeks.map(w => {
      const safeFlow = safe_haven_capital_inflow_b / 20;
      const base = gold_spot_price * (1 + 0.05 * safeFlow * (w / 52));
      const noise = (Math.sin(w * 0.2) * 0.005 + Math.random() * 0.003) * base;
      return base + noise;
    });
    return { sp500Series, defenseSeries, brentSeries, goldSeries };
  }, [sp500_index, defense_basket_index, brent_crude_price, gold_spot_price, oil_supply_shock_pct, escalation_stage, safe_haven_capital_inflow_b]);

  const sectorReturns = useMemo(() => {
    const defenseReturn = (defense_basket_index - 100) * 1.2;
    const energyReturn = (brent_crude_price / 75 - 1) * 80 - 5 * escalation_stage;
    const aviationReturn = (aviation_travel_index - 100) * 1.5;
    const techReturn = -10 * escalation_stage - 0.5 * oil_supply_shock_pct;
    const staplesReturn = 5 - 0.3 * escalation_stage + 0.2 * (ceasefire_probability_pct / 100);
    const bondsReturn = 3 * escalation_stage * (1 - ceasefire_probability_pct / 100);
    return [
      { name: "Aerospace & Defense", return: defenseReturn, color: "#8B0000" },
      { name: "Energy", return: energyReturn, color: "#FF8C00" },
      { name: "Commercial Aviation", return: aviationReturn, color: "#4169E1" },
      { name: "Tech Growth", return: techReturn, color: "#9370DB" },
      { name: "Consumer Staples", return: staplesReturn, color: "#2E8B57" },
      { name: "Sovereign Bonds", return: bondsReturn, color: "#DC143C" }
    ];
  }, [defense_basket_index, brent_crude_price, aviation_travel_index, escalation_stage, oil_supply_shock_pct, ceasefire_probability_pct]);

  const [particles, setParticles] = useState(() => {
    const array = [];
    const totalParticles = 40;
    for (let i = 0; i < totalParticles; i++) {
      array.push({
        id: i,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: Math.random() * 0.6 + 0.4,
        type: Math.random() > 0.5 ? "equity" : "haven"
      });
    }
    return array;
  });

  useEffect(() => {
    let animationFrameId;
    const tick = () => {
      setParticles(prevParticles => {
        return prevParticles.map(p => {
          const newP = { ...p };
          if (newP.type === "equity") {
            newP.vx -= 0.02 * escalation_stage;
            newP.vy -= 0.01 * oil_supply_shock_pct / 10;
          } else {
            newP.vx += 0.01 * safe_haven_capital_inflow_b / 50;
            newP.vy -= 0.005 * ceasefire_probability_pct / 10;
          }
          newP.x += newP.vx;
          newP.y += newP.vy;
          if (newP.x < 0 || newP.x > 400 || newP.y < 0 || newP.y > 180) {
            newP.x = 100 + Math.random() * 200;
            newP.y = 100 + Math.random() * 100;
            newP.vx = (Math.random() - 0.5) * 0.8;
            newP.vy = (Math.random() - 0.5) * 0.8;
          }
          return newP;
        });
      });
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [escalation_stage, oil_supply_shock_pct, safe_haven_capital_inflow_b, ceasefire_probability_pct]);

  const statusBadge = () => {
    if (escalation_stage === 0) return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Peace</span>;
    if (escalation_stage === 1) return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Tension</span>;
    if (escalation_stage === 2) return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">Conventional War</span>;
    return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">Total Blockade</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Geopolitical Conflict & Wartime Financial Contagion Simulation</h1>
        <p className="text-sm text-gray-600">Interactive macro-economic and financial asset simulation modeling how the outbreak and escalation of war impact equities, commodities, safe-haven flows, sector divergences, and market volatility.</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-medium">Regime: </span>
          {statusBadge()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          { id: "sp500", label: "S&P 500 Broad Index", unit: "pts", precision: 0 },
          { id: "brent_crude", label: "Brent Crude Oil", unit: "$/bbl", precision: 2 },
          { id: "gold_spot", label: "Gold Spot Bullion", unit: "$/oz", precision: 1 },
          { id: "vix_index", label: "CBOE VIX Volatility", unit: "pts", precision: 1 },
          { id: "safe_haven_flow", label: "Safe-Haven Capital Inflow", unit: "$B", precision: 1 },
          { id: "inflation_exp", label: "Breakeven Inflation Expectation", unit: "%", precision: 2 }
        ].map(m => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">{m.label}</h3>
              <span className="text-xs bg-gray-100 rounded px-2 py-0.5">{m.unit}</span>
            </div>
            <div className="text-2xl font-bold">
              {m.id === "sp500" ? Math.round(sp500_index) :
                m.id === "brent_crude" ? brent_crude_price.toFixed(m.precision) :
                m.id === "gold_spot" ? gold_spot_price.toFixed(m.precision) :
                m.id === "vix_index" ? vix_volatility.toFixed(m.precision) :
                m.id === "safe_haven_flow" ? safe_haven_capital_inflow_b.toFixed(m.precision) :
                inflation_expectation_pct.toFixed(m.precision)}
            </div>
          </div>
        ))}
      </div>

      <div className="h-[500px] w-full relative bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="absolute inset-0">
          <svg viewBox="0 0 940 440" className="w-full h-full">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF4500" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#FFD700" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4169E1" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#1E90FF" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            {/* Multi-asset time chart */}
            <g className="stroke-2">
              <path d={`M 50 380 
                ${weeks.map((w, i) => `L ${50 + (w * 16)} ${380 - timeSeriesData.sp500Series[i] / 20}`).join(" ")}`} 
                stroke="#1E90FF" fill="none" />
              <path d={`M 50 380 
                ${weeks.map((w, i) => `L ${50 + (w * 16)} ${380 - timeSeriesData.defenseSeries[i] / 2}`).join(" ")}`} 
                stroke="#8B0000" fill="none" />
              <path d={`M 50 380 
                ${weeks.map((w, i) => `L ${50 + (w * 16)} ${380 - timeSeriesData.brentSeries[i] / 4}`).join(" ")}`} 
                stroke="#FF8C00" fill="none" />
              <path d={`M 50 380 
                ${weeks.map((w, i) => `L ${50 + (w * 16)} ${380 - timeSeriesData.goldSeries[i] / 20}`).join(" ")}`} 
                stroke="#FFD700" fill="none" />
            </g>
            <text x="50" y="30" fontSize="12" fill="#333">Multi-Asset Performance (52 Weeks)</text>
            <text x="50" y="395" fontSize="10" fill="#666">Weeks</text>
            <text x="10" y="200" fontSize="10" fill="#666" transform="rotate(-90 10,200)">Index Value</text>

            {/* Sector divergence heatmap */}
            <g transform="translate(460, 25)">
              <text x="0" y="-8" fontSize="12" fontWeight="bold" fill="#333">Sector Divergence Returns</text>
              {sectorReturns.map((s, i) => (
                <g key={s.name} transform={`translate(0, ${i * 36})`}>
                  <rect x="0" y="0" width={190} height="26" fill={s.return > 0 ? "#bbf7d0" : "#fecaca"} stroke={s.return > 0 ? "#86efac" : "#fca5a5"} rx="4" />
                  <text x="8" y="17" fontSize="11" fontWeight="500" fill="#1f2937">{s.name}</text>
                  <text x="182" y="17" fontSize="11" fontWeight="bold" fill={s.return > 0 ? "#15803d" : "#b91c1c"} textAnchor="end">{s.return > 0 ? "+" : ""}{s.return.toFixed(1)}%</text>
                </g>
              ))}
            </g>

            {/* VIX panic radial meter */}
            <g transform="translate(800, 110)">
              <circle cx="0" cy="0" r="70" fill="none" stroke="#E5E7EB" strokeWidth="8" />
              <circle cx="0" cy="0" r="70" fill="none" stroke={vix_volatility > 35 ? "#ef4444" : vix_volatility > 25 ? "#f59e0b" : "#10b981"} 
                strokeWidth="8" strokeDasharray={`${Math.min(vix_volatility / 40 * 2 * Math.PI * 70, 2 * Math.PI * 70)} ${2 * Math.PI * 70}`} 
                strokeLinecap="round" transform="rotate(-90)" />
              <text x="0" y="5" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#111827">{vix_volatility.toFixed(1)}</text>
              <text x="0" y="24" fontSize="11" fontWeight="600" textAnchor="middle" fill="#6b7280">CBOE VIX</text>
            </g>

            {/* Capital flight sankey particle flow */}
            <g transform="translate(680, 260)">
              <text x="0" y="-10" fontSize="12" fontWeight="bold" fill="#333">Safe-Haven Flight Flow (Gold & Bonds)</text>
              <rect x="0" y="0" width="240" height="120" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x="10" y="20" fontSize="10" fill="#ef4444">Equity Outflows ▼</text>
              <text x="230" y="20" fontSize="10" fill="#eab308" textAnchor="end">Havens Inflow ▲</text>
              <g>
                {particles.map(p => (
                  <circle key={p.id} cx={15 + (p.x % 210)} cy={25 + (p.y % 85)} r={2.5} fill={p.type === "equity" ? "#ef4444" : "#eab308"} opacity={0.85} />
                ))}
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { id: "escalation_stage", label: "Conflict Escalation Level", min: 0, max: 3, step: 1, unit: "Stage (0: Peace, 1: Tension, 2: Conventional War, 3: Total Blockade)" },
          { id: "oil_supply_shock_pct", label: "Global Crude Oil Supply Disruption", min: 0, max: 30, step: 1, unit: "% Global Cut" },
          { id: "war_duration_weeks", label: "Conflict Duration Elapsed", min: 1, max: 52, step: 1, unit: "Weeks" },
          { id: "central_bank_hawkishness_bps", label: "Central Bank Emergency Rate Hikes", min: 0, max: 400, step: 25, unit: "bps" },
          { id: "ceasefire_probability_pct", label: "Diplomatic Ceasefire Momentum", min: 0, max: 100, step: 5, unit: "% Progress" }
        ].map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">{c.label}</h3>
              <span className="text-xs bg-gray-100 rounded px-2 py-0.5">{c.unit}</span>
            </div>
            <div className="flex items-center">
              <input 
                type="range" 
                min={c.min} 
                max={c.max} 
                step={c.step} 
                value={c.id === "escalation_stage" ? escalation_stage :
                  c.id === "oil_supply_shock_pct" ? oil_supply_shock_pct :
                  c.id === "war_duration_weeks" ? war_duration_weeks :
                  c.id === "central_bank_hawkishness_bps" ? central_bank_hawkishness_bps :
                  ceasefire_probability_pct} 
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (c.id === "escalation_stage") setEscalationStage(val);
                  else if (c.id === "oil_supply_shock_pct") setOilSupplyShockPct(val);
                  else if (c.id === "war_duration_weeks") setWarDurationWeeks(val);
                  else if (c.id === "central_bank_hawkishness_bps") setCentralBankHawkishnessBps(val);
                  else setCeasefireProbabilityPct(val);
                }} 
                className="w-full h-4 bg-gray-200 rounded cursor-pointer" 
              />
              <span className="ml-3 text-xs font-mono">
                {c.id === "escalation_stage" ? escalation_stage :
                  c.id === "oil_supply_shock_pct" ? oil_supply_shock_pct :
                  c.id === "war_duration_weeks" ? war_duration_weeks :
                  c.id === "central_bank_hawkishness_bps" ? central_bank_hawkishness_bps :
                  ceasefire_probability_pct}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Flight to Safety & Capital Migration", content: "During wartime escalation, asset managers rapidly de-risk portfolios. Capital flees equity risk premiums into sovereign balance sheets (US 10-Year Treasuries), physical gold reserves, and reserve currencies (USD, CHF)." },
          { title: "The Energy Supply Chokepoint & Stagflation", content: "Modern warfare disproportionately weaponizes energy straits (Strait of Hormuz, Bab-el-Mandeb, pipelines). Spikes in crude oil increase input costs across all industries, creating cost-push stagflation that ties central banks' hands." },
          { title: "Asymmetric Sector Divergence", content: "While broad indices fall, Aerospace & Defense primes (missile systems, ammunition, surveillance) experience secular budget re-ratings (+30-70%), while airlines and consumer discretionary face collapsing operating margins." },
          { title: "Historical War Cycles: Initial Panic vs. 12-Month Rebound", content: "Empirical market history (1973 Yom Kippur, 1990 Desert Storm, 2003 Iraq) demonstrates that broad equities typically bottom within 3 to 6 weeks of initial kinetic action, often recovering pre-war valuations within 12 months as uncertainty resolves." }
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-800 mb-2">{card.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{card.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
