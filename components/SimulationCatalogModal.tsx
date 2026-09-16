"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Play, Star, Clock, Filter, ArrowUpRight } from "lucide-react";
import { SIMULATIONS_CATALOG, SimulationItem } from "@/lib/simulationsData";

interface SimulationCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSimulation: (simulation: SimulationItem) => void;
}

export const SimulationCatalogModal: React.FC<SimulationCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectSimulation,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Quantum",
    "Astrophysics",
    "Fluid Dynamics",
    "Electronics",
    "Neuroscience",
    "Biophysics",
    "Economics",
    "Archaeology",
  ];

  const filteredSimulations = useMemo(() => {
    return SIMULATIONS_CATALOG.filter((sim) => {
      const matchesSearch =
        sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.equations.some((eq) => eq.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || sim.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl liquid-panel rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header & Search Bar */}
        <div className="p-6 border-b border-white/10 bg-black/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Simulations Catalog
              </h2>
              <p className="text-xs text-gray-400">
                11 Interactive React 18 + GSAP Physics & Science Models • LangGraph Generated
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search simulations by keyword, theory, equation, or domain..."
              autoFocus
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-sky-400 font-sans"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-white text-black font-semibold shadow"
                    : "liquid-glass text-gray-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredSimulations.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No simulations found matching &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSimulations.map((sim) => (
                <div
                  key={sim.id}
                  className="p-5 rounded-2xl liquid-glass hover:bg-white/[0.04] transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => {
                    onSelectSimulation(sim);
                    onClose();
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/10 text-sky-300">
                        {sim.category}
                      </span>
                      <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{sim.rating.split(" ")[0]}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                        {sim.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed font-light">
                        {sim.description}
                      </p>
                    </div>

                    <div className="pt-1 flex flex-wrap gap-1">
                      {sim.equations.slice(0, 2).map((eq, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-gray-400 border border-white/5 truncate max-w-full"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{sim.duration}</span>
                    </div>

                    <button className="flex items-center gap-1 text-xs font-semibold text-white group-hover:text-sky-400 transition-colors">
                      <span>Launch</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
