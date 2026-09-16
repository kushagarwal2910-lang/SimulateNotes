"use client";

import React, { useState } from "react";
import { Search, User, Menu, X, Sparkles, Cpu, GitBranch, BookOpen, Layers } from "lucide-react";

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenRag: () => void;
  onOpenCodeAgent: () => void;
  onOpenCatalog: () => void;
  onOpenGraph: () => void;
  onOpenDocs: () => void;
  activeSimulationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenRag,
  onOpenCodeAgent,
  onOpenCatalog,
  onOpenGraph,
  onOpenDocs,
  activeSimulationCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Simulations", icon: Layers, action: onOpenCatalog, delay: "100ms", badge: `${activeSimulationCount}` },
    { label: "RAG Spec Agent", icon: Sparkles, action: onOpenRag, delay: "150ms", badge: "Agent 1" },
    { label: "Code Generator", icon: Cpu, action: onOpenCodeAgent, delay: "200ms", badge: "Agent 2" },
    { label: "State Graph", icon: GitBranch, action: onOpenGraph, delay: "250ms" },
    { label: "Documentation", icon: BookOpen, action: onOpenDocs, delay: "300ms" },
  ];

  return (
    <>
      <header className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6 select-none">
        {/* Left: Text Brand Logo with blurFadeUp at 0ms */}
        <div
          className="animate-blur-fade-up flex items-center gap-3 cursor-pointer group"
          style={{ animationDelay: "0ms" }}
          onClick={onOpenCatalog}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full liquid-glass flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform duration-300">
            <span className="font-mono font-black text-sm md:text-base tracking-tighter">Æ</span>
          </div>
          <div className="flex flex-col">
            <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>SimulateNotes</span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">
                LangGraph
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 -mt-1 font-mono tracking-wider hidden sm:block">
              AUTONOMOUS PHYSICS & SIMULATION ENGINE
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links (staggered 100ms - 300ms) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={link.action}
                style={{ animationDelay: link.delay }}
                className="animate-blur-fade-up px-3.5 py-1.5 rounded-full text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-2 group"
              >
                <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-sky-400 transition-colors" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-gray-300 border border-white/5">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Search & Profile & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {/* Search Button (sm and up) with 350ms delay */}
          <button
            onClick={onOpenSearch}
            style={{ animationDelay: "350ms" }}
            className="hidden sm:flex items-center gap-2.5 px-4 md:px-6 py-2 rounded-full liquid-glass text-sm text-gray-200 hover:text-white animate-blur-fade-up group"
          >
            <Search className="w-4 h-4 text-gray-400 group-hover:text-sky-300 transition-colors" />
            <span className="font-normal text-xs md:text-sm">Search</span>
            <kbd className="hidden md:inline-block text-[10px] font-mono text-gray-400 bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
              ⌘K
            </kbd>
          </button>

          {/* User/Profile Circle Button with 400ms delay */}
          <button
            onClick={onOpenDocs}
            style={{ animationDelay: "400ms" }}
            aria-label="User Profile and Agent Status"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full liquid-glass text-gray-200 hover:text-white animate-blur-fade-up"
          >
            <User className="w-[18px] h-[18px]" />
          </button>

          {/* Hamburger Menu Button (visible below lg) with 350ms delay */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ animationDelay: "350ms" }}
            aria-label="Toggle navigation menu"
            className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-full liquid-glass text-gray-200 hover:text-white animate-blur-fade-up"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <Menu
                className={`absolute w-5 h-5 transition-all duration-500 ease-out ${
                  mobileMenuOpen
                    ? "rotate-180 scale-50 opacity-0 pointer-events-none"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <X
                className={`absolute w-5 h-5 transition-all duration-500 ease-out ${
                  mobileMenuOpen
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-180 scale-50 opacity-0 pointer-events-none"
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown (below lg breakpoint) */}
      <div
        className={`lg:hidden absolute left-0 right-0 top-[72px] z-40 px-4 py-4 transition-all duration-500 ease-out ${
          mobileMenuOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-gray-900/95 backdrop-blur-lg border-t border-b border-gray-800 shadow-2xl rounded-2xl p-4 flex flex-col gap-1">
          {navLinks.map((link, idx) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => {
                  link.action();
                  setMobileMenuOpen(false);
                }}
                style={{
                  transitionDelay: mobileMenuOpen ? `${idx * 50}ms` : "0ms",
                }}
                className={`flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-800/50 text-left text-sm text-gray-200 transition-all duration-300 ${
                  mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-sky-400" />
                  <span className="font-medium">{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Mobile Search & Profile row */}
          <div className="pt-3 mt-2 border-t border-gray-800 flex items-center justify-between gap-3 sm:hidden">
            <button
              onClick={() => {
                onOpenSearch();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full liquid-glass text-xs font-medium text-gray-200"
            >
              <Search className="w-4 h-4 text-sky-400" />
              <span>Search Catalog</span>
            </button>
            <button
              onClick={() => {
                onOpenDocs();
                setMobileMenuOpen(false);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full liquid-glass text-gray-200"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
