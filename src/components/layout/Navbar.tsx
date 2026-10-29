import React from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Sparkles,
  Plus,
  Clock,
  Download,
  CheckCircle2,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Filter,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    currentYear,
    currentMonth,
    setYear,
    setMonth,
    goToToday,
    nextPeriod,
    prevPeriod,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    calendarView,
    setCalendarView,
    hasGeminiKey,
    setIsApiSidebarOpen,
    allResolvedEvents,
  } = useApp();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const upcomingOpportunitiesCount = allResolvedEvents.filter(
    (e) => e.daysRemaining >= 0 && e.daysRemaining <= 60
  ).length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Brand & Mode switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                StockNiche <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 font-extrabold">PRO</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                Adobe Stock Contributor
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Commercial Event & Trend Intelligence</p>
          </div>
        </div>
      </div>

      {/* Date Navigation Bar (if in calendar or global events) */}
      <div className="hidden md:flex items-center bg-slate-950/70 border border-slate-800/80 rounded-xl p-1 gap-1">
        <button
          onClick={prevPeriod}
          title="Previous"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Month Selector */}
        <select
          value={currentMonth}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="bg-transparent text-sm font-medium text-slate-200 px-2 py-1 outline-none cursor-pointer hover:text-cyan-300 transition-colors"
        >
          {monthNames.map((name, idx) => (
            <option key={name} value={idx + 1} className="bg-slate-900 text-slate-200">
              {name}
            </option>
          ))}
        </select>

        {/* Year Selector */}
        <select
          value={currentYear}
          onChange={(e) => setYear(Number(e.target.value))}
          className="bg-transparent text-sm font-semibold text-cyan-400 px-2 py-1 outline-none cursor-pointer hover:text-cyan-300 transition-colors"
        >
          {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
            <option key={yr} value={yr} className="bg-slate-900 text-slate-200">
              {yr}
            </option>
          ))}
        </select>

        <button
          onClick={nextPeriod}
          title="Next"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          onClick={goToToday}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 border border-slate-700/50 transition-all"
        >
          Today
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-xs relative hidden lg:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search holidays, vectors, tags..."
          className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 placeholder:text-slate-500 text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Gemini API Settings Button */}
        <button
          onClick={() => setIsApiSidebarOpen(true)}
          title="Open Gemini API Settings"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
            hasGeminiKey
              ? 'bg-emerald-950/60 hover:bg-emerald-900/70 border-emerald-700/60 text-emerald-300'
              : 'bg-amber-950/60 hover:bg-amber-900/70 border-amber-700/60 text-amber-300'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{hasGeminiKey ? 'API Key Ready' : 'API Settings'}</span>
        </button>

        {/* Create Project Button */}
        <button
          onClick={() => setActiveTab('projects')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Project</span>
        </button>
      </div>
    </header>
  );
};
