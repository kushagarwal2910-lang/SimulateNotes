import React, { useState, useMemo, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function IntegrationAreaUnderCurveSimulation() {
  const [function_type, setFunctionType] = useState(0);
  const [a, setA] = useState(0);
  const [b, setB] = useState(4);
  const [n_rectangles, setNRectangles] = useState(10);
  const [show_antiderivative, setShowAntiderivative] = useState(1);
  const [x, setX] = useState(0);
  const svgRef = useRef(null);
  const gsapContextRef = useRef();

  // Helper function to compute f(x) for a given x value and function_type
  const computeFunctionValue = (xVal, type) => {
    if (type === 0) return xVal;
    if (type === 1) return Math.pow(xVal, 2);
    return Math.sin(xVal);
  };

  // Helper function to compute antiderivative F(x) for a given x value and function_type
  const computeAntiderivativeValue = (xVal, type) => {
    if (type === 0) return xVal * xVal / 2;
    if (type === 1) return Math.pow(xVal, 3) / 3;
    return -Math.cos(xVal);
  };

  const functionValue = useMemo((xVal) => computeFunctionValue(xVal, function_type), [function_type]);

  const rectangleWidth = useMemo(() => (b - a) / n_rectangles, [a, b, n_rectangles]);

  const riemannSum = useMemo(() => {
    if (n_rectangles <= 0) return 0;
    const width = (b - a) / n_rectangles;
    let sum = 0;
    for (let i = 0; i < n_rectangles; i++) {
      const xi = a + i * width;
      sum += computeFunctionValue(xi, function_type) * width;
    }
    return sum;
  }, [a, b, n_rectangles, function_type]);

  const exactIntegral = useMemo(() => {
    if (function_type === 0) return (b * b / 2 - a * a / 2);
    if (function_type === 1) return (Math.pow(b, 3) / 3 - Math.pow(a, 3) / 3);
    return (Math.cos(a) - Math.cos(b));
  }, [a, b, function_type]);

  const antiderivativeAtX = useMemo(() => computeAntiderivativeValue(x, function_type), [x, function_type]);

  const scaleX = useMemo(() => 960 / 12, []); // -6 to 6
  const scaleY = useMemo(() => 480 / 8, []); // -4 to 4
  const offsetX = useMemo(() => 960 / 2, []); // center x=0
  const offsetY = useMemo(() => 480 / 2, []); // center y=0

  const functionPath = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const xVal = -6 + (12 * i) / 100;
      const yVal = computeFunctionValue(xVal, function_type);
      const px = offsetX + xVal * scaleX;
      const py = offsetY - yVal * scaleY;
      points.push(`${px},${py}`);
    }
    return points.join(' ');
  }, [function_type, offsetX, offsetY, scaleX, scaleY]);

  const antiderivativePath = useMemo(() => {
    if (!show_antiderivative) return '';
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const xVal = -6 + (12 * i) / 100;
      const yVal = computeAntiderivativeValue(xVal, function_type);
      const px = offsetX + xVal * scaleX + offsetX;
      const py = offsetY - yVal * scaleY;
      points.push(`${px},${py}`);
    }
    return points.join(' ');
  }, [show_antiderivative, function_type, offsetX, offsetY, scaleX, scaleY]);

  const areaPath = useMemo(() => {
    if (a >= b) return '';
    const points = [];
    const samples = 50;
    for (let i = 0; i <= samples; i++) {
      const xVal = a + ((b - a) * i) / samples;
      const yVal = computeFunctionValue(xVal, function_type);
      const px = offsetX + xVal * scaleX;
      const py = offsetY - yVal * scaleY;
      points.push(`${px},${py}`);
    }
    // Close path to x-axis and back
    const pxB = offsetX + b * scaleX;
    const pyB = offsetY; // y=0
    const pxA = offsetX + a * scaleX;
    const pyA = offsetY; // y=0
    points.push(`${pxB},${pyB}`, `${pxA},${pyA}`);
    return points.join(' ');
  }, [a, b, function_type, offsetX, offsetY, scaleX, scaleY]);

  const rectangles = useMemo(() => {
    if (n_rectangles <= 0 || a >= b) return [];
    const width = (b - a) / n_rectangles;
    const rects = [];
    for (let i = 0; i < n_rectangles; i++) {
      const xi = a + i * width;
      const height = computeFunctionValue(xi, function_type);
      const xPos = offsetX + xi * scaleX;
      const yPos = offsetY - height * scaleY;
      const rectWidth = width * scaleX;
      const rectHeight = -height * scaleY; // negative because y increases downward
      rects.push({ x: xPos, y: yPos, width: rectWidth, height: rectHeight });
    }
    return rects;
  }, [a, b, n_rectangles, function_type, offsetX, offsetY, scaleX, scaleY]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // GSAP animations can go here if needed
    }, svgRef.current);
    gsapContextRef.current = ctx;
    return () => ctx.revert();
  }, []);

  const handleAnimateRectangles = () => {
    setNRectangles(Math.min(n_rectangles + 10, 100));
  };

  const handleReset = () => {
    setFunctionType(0);
    setA(0);
    setB(4);
    setNRectangles(10);
    setShowAntiderivative(1);
    setX(0);
  };

  const telemetryMetrics = [
    { label: 'Riemann Sum Approximation', value: riemannSum.toFixed(3), unit: 'units²' },
    { label: 'Exact Integral Value', value: exactIntegral.toFixed(3), unit: 'units²' },
    { label: 'Error (|Exact - Approx|)', value: Math.abs(exactIntegral - riemannSum).toFixed(3), unit: 'units²' },
    { label: 'Number of Rectangles', value: n_rectangles, unit: '' },
    { label: 'Interval Width (b-a)', value: (b - a).toFixed(3), unit: '' }
  ];

  const pedagogicalCallouts = [
    {
      step: 1,
      title: 'The Area Problem',
      text: 'We want to find the area under the curve f(x) between x=a and x=b. Simple geometry works for rectangles and triangles, but not for arbitrary curves. Integration solves this by summing infinitely many infinitesimally thin rectangles.'
    },
    {
      step: 2,
      title: 'Riemann Sums: Building the Approximation',
      text: 'We approximate the area by dividing [a,b] into n rectangles. Each rectangle has width Δx = (b-a)/n and height f(x_i). As n increases (more rectangles), the approximation improves. The Riemann sum Σ f(x_i)Δx approaches the true area as n→∞.'
    },
    {
      step: 3,
      title: 'The Fundamental Theorem of Calculus',
      text: "Integration and differentiation are inverse processes. If F(x) is an antiderivative of f(x) (meaning F'(x)=f(x)), then the exact area under f(x) from a to b is F(b)-F(a). This is why we can compute areas using antiderivatives instead of limits of sums."
    },
    {
      step: 4,
      title: 'Signed Area and Physical Interpretation',
      text: 'The integral gives net signed area: area above the x-axis is positive, below is negative. In physics, if f(x) represents velocity, then ∫v(t)dt gives displacement. The area under the velocity curve equals the change in position.'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-900 text-white font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Integration as Area Under a Curve</h1>
        <p className="text-lg text-gray-300">Visualizing the Fundamental Theorem of Calculus</p>
      </header>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Telemetry HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {telemetryMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="text-sm font-medium text-gray-400">{metric.label}</div>
              <div className="text-2xl font-bold mt-1">{metric.value} <span className="text-xs">{metric.unit}</span></div>
            </div>
          ))}
        </div>

        {/* Dedicated Simulation Stage */}
        <div className="relative h-[500px] w-full bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50">
          <svg ref={svgRef} className="w-full h-full" viewBox="0 0 960 480" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridGradient)" />

            {/* Grid lines */}
            <g stroke="#374151" strokeWidth="1" opacity="0.2">
              {/* Vertical grid lines every 0.5 units */}
              {[...Array(25)].map((_, i) => {
                const x = -6 + i * 0.5;
                const px = offsetX + x * scaleX;
                return <line key={i} x1={px} y1={offsetY - (-4) * scaleY} x2={px} y2={offsetY - 4 * scaleY} />;
              })}
              {/* Horizontal grid lines every 0.5 units */}
              {[...Array(17)].map((_, i) => {
                const y = -4 + i * 0.5;
                const py = offsetY - y * scaleY;
                return <line key={i} x1={offsetX + (-6) * scaleX} y1={py} x2={offsetX + 6 * scaleX} y2={py} />;
              })}
            </g>

            {/* Axes */}
            <g stroke="#6b7280" strokeWidth="2">
              <line x1={offsetX + (-6) * scaleX} y1={offsetY} x2={offsetX + 6 * scaleX} y2={offsetY} markerEnd="url(#arrow)" />
              <line x1={offsetX} y1={offsetY + (-4) * scaleY} x2={offsetX} y2={offsetY - 4 * scaleY} markerEnd="url(#arrow)" />
            </g>

            {/* Arrowhead definition */}
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>

            {/* Axis labels */}
            <g fill="#9ca3af" fontSize="12" textAnchor="middle">
              {/* X-axis labels */}
              {[...Array(13)].map((_, i) => {
                const xVal = -6 + i;
                const px = offsetX + xVal * scaleX;
                return <text key={i} x={px} y={offsetY + 20}>{xVal}</text>;
              })}
              {/* Y-axis labels */}
              {[...Array(9)].map((_, i) => {
                const yVal = -4 + i;
                const py = offsetY - yVal * scaleY;
                return <text key={i} x={offsetX - 15} y={py + 4}>{yVal}</text>;
              })}
            </g>

            {/* Function curve */}
            <path d={`M ${functionPath}`} fill="none" stroke="#38bdf8" strokeWidth="3" />

            {/* Area shading */}
            {areaPath && (
              <path d={`M ${areaPath} Z`} fill="#f43f5e" fillOpacity="0.3" stroke="none" />
            )}

            {/* Riemann rectangles */}
            <g>
              {rectangles.map((rect, index) => (
                <rect key={index} x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill="#38bdf8" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
              ))}
            </g>

            {/* Antiderivative curve */}
            {show_antiderivative && antiderivativePath && (
              <path d={`M ${antiderivativePath}`} fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="6,4" />
            )}

            {/* Point on antiderivative */}
            {show_antiderivative && (
              <g>
                <circle cx={offsetX + x * scaleX} cy={offsetY - antiderivativeAtX * scaleY} r="6" fill="#34d399" />
                <text
                  x={offsetX + x * scaleX}
                  y={offsetY - antiderivativeAtX * scaleY - 10}
                  textAnchor="middle"
                  fill="#34d399"
                  fontSize="12"
                >
                  F({x.toFixed(1)}) = {antiderivativeAtX.toFixed(2)}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Interactive Control Deck */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Function Type</label>
            <select
              value={function_type}
              onChange={(e) => setFunctionType(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 text-white"
            >
              <option value={0}>Linear f(x)=x</option>
              <option value={1}>Quadratic f(x)=x²</option>
              <option value={2}>Sine f(x)=sin(x)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Lower Limit (a)</label>
            <input
              type="range"
              min={-5}
              max={4}
              step={0.1}
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>-5</span>
              <span>{a.toFixed(1)}</span>
              <span>4</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Upper Limit (b)</label>
            <input
              type="range"
              min={-4}
              max={5}
              step={0.1}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>-4</span>
              <span>{b.toFixed(1)}</span>
              <span>5</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Number of Rectangles</label>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={n_rectangles}
              onChange={(e) => setNRectangles(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1</span>
              <span>{n_rectangles}</span>
              <span>100</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={show_antiderivative === 1}
              onChange={(e) => setShowAntiderivative(e.target.checked ? 1 : 0)}
              className="h-4 w-4 text-primary rounded"
            />
            <label className="text-sm font-medium text-gray-300">Show Antiderivative</label>
          </div>

          <div className="pt-4">
            <button
              onClick={handleAnimateRectangles}
              className="w-full px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
            >
              Animate Rectangles Increasing
            </button>
            <button
              onClick={handleReset}
              className="w-full mt-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Educational Theory Cards */}
      <div className="grid grid-cols-1 gap-4">
        {pedagogicalCallouts.map((callout) => (
          <div key={callout.step} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-2">{callout.title}</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{callout.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
