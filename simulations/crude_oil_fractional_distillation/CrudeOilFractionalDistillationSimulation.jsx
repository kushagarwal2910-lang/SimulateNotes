import React, { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CrudeOilFractionalDistillationSimulation() {
  const [furnaceTemp, setFurnaceTemp] = useState(380);
  const [feedRate, setFeedRate] = useState(50000);
  const [columnPressure, setColumnPressure] = useState(1.2);

  const fractions = [
    { name: "Refinery Gas / LPG", tempRange: "< 40°C", carbonChain: "C1 - C4", color: "#ff6b6b", yPos: 30 },
    { name: "Gasoline / Petrol", tempRange: "40 - 110°C", carbonChain: "C5 - C10", color: "#ffd93d", yPos: 80 },
    { name: "Naphtha", tempRange: "110 - 180°C", carbonChain: "C6 - C11", color: "#6bcb77", yPos: 130 },
    { name: "Kerosene / Jet Fuel", tempRange: "180 - 260°C", carbonChain: "C11 - C16", color: "#4d96ff", yPos: 180 },
    { name: "Diesel / Gas Oil", tempRange: "260 - 340°C", carbonChain: "C16 - C20", color: "#9b59b6", yPos: 230 },
    { name: "Heavy Fuel & Lube Oil", tempRange: "340 - 450°C", carbonChain: "C20 - C50", color: "#8e44ad", yPos: 280 },
    { name: "Bitumen Asphalt", tempRange: "> 450°C", carbonChain: "C50+", color: "#2c3e50", yPos: 330 }
  ];

  const columnHeight = 350;
  const columnWidth = 120;
  const columnX = 400;
  const columnY = 20;

  const vaporPath = useMemo(() => {
    const path = [];
    const points = 50;
    for (let i = 0; i <= points; i++) {
      const y = columnY + (i / points) * columnHeight;
      const tempAtHeight = furnaceTemp - ((furnaceTemp - 40) * (y - columnY)) / columnHeight;
      const xOffset = Math.sin((y - columnY) * 0.02) * 8 * (feedRate / 50000);
      path.push(`${columnX + columnWidth / 2 + xOffset},${y}`);
    }
    return `M ${path.join(" L ")}`;
  }, [furnaceTemp, feedRate, columnPressure]);

  const liquidPath = useMemo(() => {
    const path = [];
    const points = 50;
    for (let i = 0; i <= points; i++) {
      const y = columnY + (i / points) * columnHeight;
      const tempAtHeight = furnaceTemp - ((furnaceTemp - 40) * (y - columnY)) / columnHeight;
      const xOffset = -Math.sin((y - columnY) * 0.02) * 6 * (feedRate / 50000);
      path.push(`${columnX + columnWidth / 2 + xOffset},${y}`);
    }
    return `M ${path.join(" L ")}`;
  }, [furnaceTemp, feedRate, columnPressure]);

  const trayYPositions = useMemo(() => {
    return fractions.map(f => ({
      name: f.name,
      y: columnY + (f.yPos / 350) * columnHeight,
      color: f.color
    }));
  }, []);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      arr.push({
        id: i,
        x: columnX + columnWidth / 2 + (Math.random() - 0.5) * 20,
        y: columnY + Math.random() * columnHeight,
        size: 2 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1.5,
        type: Math.random() > 0.5 ? "vapor" : "liquid"
      });
    }
    return arr;
  }, [columnX, columnWidth, columnY, columnHeight]);

  const telemetryMetrics = useMemo(() => [
    {
      label: "Furnace Temperature",
      value: `${furnaceTemp}°C`,
      status: furnaceTemp > 420 ? "high" : furnaceTemp < 300 ? "low" : "normal"
    },
    {
      label: "Feed Rate",
      value: `${feedRate.toLocaleString()} BPD`,
      status: "normal"
    },
    {
      label: "Column Pressure",
      value: `${columnPressure.toFixed(2)} atm`,
      status: columnPressure > 2.0 ? "high" : columnPressure < 1.0 ? "low" : "normal"
    },
    {
      label: "Top Product",
      value: fractions[0].name,
      status: "normal"
    },
    {
      label: "Bottom Residue",
      value: fractions[fractions.length - 1].name,
      status: "normal"
    }
  ], [furnaceTemp, feedRate, columnPressure, fractions]);

  const educationalCards = useMemo(() => [
    {
      title: "Fractional Distillation Principle",
      content: "Crude oil is heated in a furnace to vaporize components. As vapor rises through the fractionating column, it cools. Different hydrocarbons condense at different heights based on their boiling points, allowing separation into fractions."
    },
    {
      title: "Boiling Point & Carbon Chain Length",
      content: "Generally, longer carbon chains have higher boiling points. Refinery gases (C1-C4) exit at the top (<40°C), while bitumen (C50+) remains at the bottom (>450°C)."
    },
    {
      title: "Role of Pressure",
      content: "Operating pressure affects boiling points. Higher pressure increases boiling points, shifting condensation points lower in the column. Typical atmospheric distillation operates at 1.2-1.5 atm."
    }
  ], []);

  const statusBadge = useMemo(() => {
    if (furnaceTemp < 300) return { text: "Underheated", color: "#e74c3c" };
    if (furnaceTemp > 420) return { text: "Overheated", color: "#e67e22" };
    if (columnPressure > 2.0) return { text: "High Pressure", color: "#e67e22" };
    if (columnPressure < 1.0) return { text: "Low Pressure", color: "#e67e22" };
    return { text: "Optimal Operation", color: "#27ae60" };
  }, [furnaceTemp, columnPressure]);

  const controlsRef = useRef();
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.ticker.add(updateParticles);
    }, controlsRef);
    return () => ctx.revert();
  }, []);

  const updateParticles = () => {
    setParticles(prev => {
      return prev.map(p => {
        if (p.type === "vapor") {
          return {
            ...p,
            y: p.y - p.speed * (feedRate / 50000),
            x: p.x + Math.sin(p.y * 0.01) * 0.5
          };
        } else {
          return {
            ...p,
            y: p.y + p.speed * 0.5 * (feedRate / 50000),
            x: p.x - Math.sin(p.y * 0.01) * 0.5
          };
        }
      }).map(p => {
        if (p.y < columnY) {
          return {
            ...p,
            y: columnY + columnHeight,
            type: Math.random() > 0.5 ? "vapor" : "liquid"
          };
        }
        if (p.y > columnY + columnHeight) {
          return {
            ...p,
            y: columnY,
            type: Math.random() > 0.5 ? "vapor" : "liquid"
          };
        }
        return p;
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2">Crude Oil Fractional Distillation & Petroleum Derivatives</h1>
        <p className="text-gray-600">Visually demonstrate how raw crude oil is thermally separated into specific hydrocarbon fractions along a vertical fractionating column</p>
        <div className="mt-4 px-3 py-2 rounded-md text-sm font-medium" style={{ backgroundColor: statusBadge.color + "20", color: statusBadge.color }}>
          {statusBadge.text}
        </div>
      </header>

      <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
        {telemetryMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 text-center border" style={{ borderLeft: `4px solid ${metric.status === "high" ? "#e74c3c" : metric.status === "low" ? "#f39c12" : "#27ae60"}` }}>
            <p className="text-sm font-medium text-gray-600">{metric.label}</p>
            <p className="text-lg font-bold mt-1">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="relative w-full mx-auto">
        <svg viewBox="0 0 920 380" className="w-full h-[500px] mx-auto bg-white rounded-xl shadow-lg">
          <defs>
            <linearGradient id="vaporGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#3498db", stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: "#2c3e50", stopOpacity: 0.2 }} />
            </linearGradient>
            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#95a5a6", stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: "#7f8c8d", stopOpacity: 0.4 }} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3498db" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Column */}
          <rect x={columnX} y={columnY} width={columnWidth} height={columnHeight} rx="10" ry="10" fill="url(#liquidGrad)" stroke="#bdc3c7" strokeWidth="2" />

          {/* Trays */}
          {trayYPositions.map((tray, index) => (
            <g key={index}>
              <line x1={columnX - 10} y1={tray.y} x2={columnX + columnWidth + 10} y2={tray.y} stroke="#ecf0f1" strokeWidth="1" strokeDasharray="4,2" />
              <text x={columnX + columnWidth + 20} y={tray.y + 4} fontSize="10" fill="#7f8c8d">{tray.name}</text>
            </g>
          ))}

          {/* Vapor Path */}
          <path d={vaporPath} fill="none" stroke="url(#vaporGrad)" strokeWidth="3" filter="url(#glow)" />

          {/* Liquid Path */}
          <path d={liquidPath} fill="none" stroke="url(#liquidGrad)" strokeWidth="3" />

          {/* Particles */}
          {particles.map(p => (
            <circle key={p.id} cx={p.x} cy={p.y} r={p.size} fill={p.type === "vapor" ? "#3498db" : "#95a5a6"} opacity={p.type === "vapor" ? 0.7 : 0.9}
            />
          ))}

          {/* Feed Inlet */}
          <rect x={columnX - 30} y={columnY + columnHeight - 20} width={20} height={15} fill="#e67e22" rx="3" />
          <text x={columnX - 40} y={columnY + columnHeight - 5} fontSize="10" fill="white" textAnchor="end">Feed</text>

          {/* Product Outlets */}
          {fractions.map((frac, index) => (
            <g key={index}>
              <rect x={columnX + columnWidth + 10} y={trayYPositions[index].y - 8} width={25} height={16} fill={frac.color} rx="4" />
              <text x={columnX + columnWidth + 22} y={trayYPositions[index].y} fontSize="9" fill="white" textAnchor="middle">{frac.name.split(" ")[0]}</text>
            </g>
          ))}

          {/* Temperature Gradient */}
          <linearGradient id="tempGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#e74c3c" }} />
            <stop offset="100%" style={{ stopColor: "#3498db" }} />
          </linearGradient>
          <rect x={50} y={columnY} width={20} height={columnHeight} fill="url(#tempGrad)" />
          <text x={40} y={columnY - 10} fontSize="10" textAnchor="end">Hot</text>
          <text x={40} y={columnY + columnHeight + 15} fontSize="10" textAnchor="end">Cold</text>
        </svg>
      </div>

      <div className="p-6 bg-white shadow-md">
        <h2 className="text-xl font-bold mb-4">Controls</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2">Furnace Inlet Temperature (°C)</label>
            <div className="flex items-center">
              <input
                type="range"
                min={280}
                max={450}
                value={furnaceTemp}
                onChange={(e) => setFurnaceTemp(Number(e.target.value))}
                className="w-full"
              />
              <span className="ml-3 font-mono">{furnaceTemp}°C</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Crude Feed Flow Rate (BPD)</label>
            <div className="flex items-center">
              <input
                type="range"
                min={10000}
                max={100000}
                value={feedRate}
                onChange={(e) => setFeedRate(Number(e.target.value))}
                className="w-full"
              />
              <span className="ml-3 font-mono">{feedRate.toLocaleString()} BPD</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Column Operating Pressure (atm)</label>
            <div className="flex items-center">
              <input
                type="range"
                min={0.8}
                max={2.5}
                step={0.1}
                value={columnPressure}
                onChange={(e) => setColumnPressure(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="ml-3 font-mono">{columnPressure.toFixed(2)} atm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white shadow-md">
        <h2 className="text-xl font-bold mb-4">Educational Insights</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {educationalCards.map((card, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <h3 className="font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-gray-700">{card.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
