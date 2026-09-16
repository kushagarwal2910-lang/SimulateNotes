"use client";

import React from "react";
import { Star, Clock, Calendar, Play, ChevronLeft, ChevronRight, Sparkles, Code2 } from "lucide-react";
import { SimulationItem } from "@/lib/simulationsData";

interface HeroContentProps {
  simulation: SimulationItem;
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onLaunchSimulation: () => void;
  onLearnMore: () => void;
  onOpenRag: () => void;
  onOpenCodeAgent: () => void;
}

export const HeroContent: React.FC<HeroContentProps> = ({
  simulation,
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  onLaunchSimulation,
  onLearnMore,
  onOpenRag,
  onOpenCodeAgent,
}) => {
  return (
    <section className="flex-1 flex flex-col justify-end px-4 sm:px-6 md:px-12 pb-8 md:pb-16 z-10 select-none">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8">
        {/* Left Side (flex-1) */}
        <div className="flex-1 max-w-4xl">
          {/* Metadata row with blur-fade-up at 300ms */}
          <div
            className="animate-blur-fade-up flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm text-gray-200"
            style={{ animationDelay: "300ms" }}
          >
            {/* Star Rating */}
            <div className="flex items-center gap-1.5 font-medium">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
              <span>{simulation.rating}</span>
            </div>

            {/* Clock / Runtime */}
            <div className="flex items-center gap-1.5 font-normal text-gray-300">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{simulation.duration}</span>
            </div>

            {/* Calendar */}
            <div className="flex items-center gap-1.5 font-normal text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{simulation.date}</span>
            </div>

            {/* Category / Discipline Pill */}
            <div className="px-2.5 py-0.5 rounded-full liquid-glass text-[11px] font-mono tracking-wide text-sky-300 border border-white/10 hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              {simulation.category}
            </div>

            {/* Index Counter */}
            <div className="text-[11px] font-mono text-gray-500 hidden md:block">
              [{String(currentIndex + 1).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}]
            </div>
          </div>

          {/* Title with blur-fade-up at 400ms */}
          <h1
            className="animate-blur-fade-up text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.04em] mb-4 md:mb-6 text-white leading-[1.08]"
            style={{ animationDelay: "400ms" }}
          >
            {simulation.title}
          </h1>

          {/* Description with blur-fade-up at 500ms */}
          <p
            className="animate-blur-fade-up text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-10 max-w-2xl font-light leading-relaxed"
            style={{ animationDelay: "500ms" }}
          >
            {simulation.description}
          </p>

          {/* CTA Buttons row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* "Watch Now" / "Launch Simulation" button with blur-fade-up at 600ms */}
            <button
              onClick={onLaunchSimulation}
              style={{ animationDelay: "600ms" }}
              className="animate-blur-fade-up flex items-center gap-2.5 bg-white text-black rounded-full font-medium px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base hover:bg-gray-200 transition-all duration-300 shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-[18px] h-[18px] fill-black text-black" />
              <span>Watch Now</span>
            </button>

            {/* "Learn More" button with blur-fade-up at 700ms */}
            <button
              onClick={onLearnMore}
              style={{ animationDelay: "700ms" }}
              className="animate-blur-fade-up flex items-center gap-2 rounded-full font-medium liquid-glass px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base text-white hover:text-white transition-all duration-300"
            >
              <Code2 className="w-4 h-4 text-gray-300" />
              <span>Learn More</span>
            </button>

            {/* Quick LangGraph Agent Launcher Pills */}
            <div className="hidden xl:flex items-center gap-2 pl-2">
              <button
                onClick={onOpenRag}
                style={{ animationDelay: "750ms" }}
                className="animate-blur-fade-up flex items-center gap-1.5 px-3.5 py-2 rounded-full liquid-glass text-xs text-sky-300 hover:text-white"
                title="Synthesize a new simulation spec from scientific literature via Tavily"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>RAG Spec</span>
              </button>
              <button
                onClick={onOpenCodeAgent}
                style={{ animationDelay: "800ms" }}
                className="animate-blur-fade-up flex items-center gap-1.5 px-3.5 py-2 rounded-full liquid-glass text-xs text-emerald-300 hover:text-white"
                title="Generate and self-heal React+GSAP code with LangGraph"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Code Agent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Navigation arrows (Previous and Next pill buttons) */}
        <div className="flex items-center gap-3 self-start md:self-end">
          {/* "Previous" button with blur-fade-up at 800ms */}
          <button
            onClick={onPrevious}
            style={{ animationDelay: "800ms" }}
            aria-label="Previous simulation"
            className="animate-blur-fade-up flex items-center justify-center rounded-full liquid-glass px-4 sm:px-6 py-2.5 sm:py-3 text-white hover:text-white transition-all duration-300 group"
          >
            <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
            <span className="hidden sm:inline-block ml-1.5 text-xs uppercase tracking-wider font-mono text-gray-300">
              Prev
            </span>
          </button>

          {/* "Next" button with blur-fade-up at 900ms */}
          <button
            onClick={onNext}
            style={{ animationDelay: "900ms" }}
            aria-label="Next simulation"
            className="animate-blur-fade-up flex items-center justify-center rounded-full liquid-glass px-4 sm:px-6 py-2.5 sm:py-3 text-white hover:text-white transition-all duration-300 group"
          >
            <span className="hidden sm:inline-block mr-1.5 text-xs uppercase tracking-wider font-mono text-gray-300">
              Next
            </span>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </section>
  );
};
