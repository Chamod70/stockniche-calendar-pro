import React, { useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  FolderGit2,
  AlertCircle,
  ArrowUpRight,
  Layers,
  Globe2,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateString } from '../../utils/dateCalculations';

export const Dashboard: React.FC = () => {
  const {
    allResolvedEvents,
    projects,
    setActiveTab,
    openEventDetail,
    discoverNichesForEvent,
    currentYear,
    currentMonth,
    setSelectedDateStr,
  } = useApp();

  const todayStr = useMemo(() => {
    const now = new Date();
    return formatDateString(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }, []);

  // Today's events
  const todayEvents = useMemo(() => {
    return allResolvedEvents.filter((e) => e.resolvedDate === todayStr);
  }, [allResolvedEvents, todayStr]);

  // Urgent events (0 - 30 days)
  const urgentEvents = useMemo(() => {
    return allResolvedEvents
      .filter((e) => e.daysRemaining >= 0 && e.daysRemaining <= 30)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [allResolvedEvents]);

  // Best opportunities this month
  const thisMonthOpportunities = useMemo(() => {
    return allResolvedEvents
      .filter((e) => e.resolvedMonth === currentMonth)
      .sort((a, b) => b.opportunityScore - a.opportunityScore);
  }, [allResolvedEvents, currentMonth]);

  // Project statistics
  const activeProjects = projects.filter((p) => p.status !== 'Published' && p.status !== 'Archived');
  const completedProjects = projects.filter((p) => p.status === 'Published');
  const totalAssetsPlanned = projects.reduce((sum, p) => sum + (p.plannedQuantity || 0), 0);

  // Asset type distribution
  const assetTypeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allResolvedEvents.forEach((e) => {
      e.bestAssetTypes.forEach((t) => {
        map[t] = (map[t] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [allResolvedEvents]);

  // Monthly event distribution across the year for workload bar chart
  const monthlyWorkload = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      eventCount: 0,
      extremeCount: 0,
    }));

    allResolvedEvents.forEach((e) => {
      if (e.resolvedMonth >= 1 && e.resolvedMonth <= 12) {
        months[e.resolvedMonth - 1].eventCount++;
        if (e.commercialValue === 'Extreme') {
          months[e.resolvedMonth - 1].extremeCount++;
        }
      }
    });

    const maxCount = Math.max(...months.map((m) => m.eventCount), 1);
    return { months, maxCount };
  }, [allResolvedEvents]);

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                2026 Production Cycle
              </span>
              <span className="text-xs text-slate-400">Contributor Intelligence Terminal</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Commercial Stock Strategy Dashboard
            </h1>
            <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
              Plan and submit vector packs, lifestyle photography, and 4K footage ahead of seasonal buyer demand spikes on Adobe Stock.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Full Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('niches')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Niche Finder</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Urgent Submission Window</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black font-mono text-rose-400 mt-2">
              {urgentEvents.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Events within 30 days</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Active Production Projects</span>
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-2">
              {activeProjects.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {totalAssetsPlanned} assets planned
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Verified Global Events</span>
              <Globe2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black font-mono text-indigo-300 mt-2">
              {allResolvedEvents.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Across 12 months</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Published Stock Kits</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
              {completedProjects.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Live in contributor portfolio</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Urgencies + Top Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Action Radar & Workload Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Production Radar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Upcoming Microstock Deadlines (Next 30 Days)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('planner')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <span>View Full Roadmap</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {urgentEvents.slice(0, 5).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => openEventDetail(ev)}
                  className="bg-slate-950 border border-slate-800/80 hover:border-cyan-600 rounded-xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][ev.resolvedMonth - 1]}
                      </span>
                      <span className="text-xs font-bold text-white font-mono leading-none">
                        {ev.resolvedDay}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {ev.name}
                        </h4>
                        {ev.commercialValue === 'Extreme' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-300 font-semibold shrink-0">
                            Extreme Commercial
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{ev.countries.slice(0, 2).join(', ')}</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-mono font-medium">
                          {ev.daysRemaining === 0 ? 'Today!' : `${ev.daysRemaining} days left`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-500 block">Opportunity</span>
                      <span className="text-xs font-bold font-mono text-cyan-400">
                        {ev.opportunityScore}/100
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        discoverNichesForEvent(ev);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Niches</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Workload Distribution SVG Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Annual Contributor Production Volume ({currentYear})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Seasonal opportunity distribution across all 12 calendar months.
                </p>
              </div>
            </div>

            {/* SVG Visual Bar Chart */}
            <div className="pt-2">
              <div className="grid grid-cols-12 gap-2 h-40 items-end px-2">
                {monthlyWorkload.months.map((m) => {
                  const heightPercent = Math.max(15, Math.round((m.eventCount / monthlyWorkload.maxCount) * 100));
                  const isCurrentMonth = m.month === currentMonth;

                  return (
                    <div
                      key={m.month}
                      className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                      onClick={() => {
                        setActiveTab('calendar');
                      }}
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-cyan-300">
                        {m.eventCount}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isCurrentMonth
                            ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-lg shadow-cyan-500/30'
                            : m.extremeCount > 0
                            ? 'bg-gradient-to-t from-slate-800 to-indigo-500 group-hover:to-cyan-400'
                            : 'bg-slate-800 group-hover:bg-slate-700'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-semibold uppercase ${
                          isCurrentMonth ? 'text-cyan-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      >
                        {m.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-800 px-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Current Active Month
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Contains Mega Retail Holidays
                </span>
                <span className="text-slate-400">Total {allResolvedEvents.length} Annual Opportunities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Top Asset Types & Current Month High-Score Niches */}
        <div className="space-y-6">
          {/* Top Asset Demand Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Highest Demand Asset Formats</span>
            </h3>

            <div className="space-y-3">
              {assetTypeCounts.map(([assetName, count], idx) => {
                const percent = Math.round((count / allResolvedEvents.length) * 100);
                return (
                  <div key={assetName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{assetName}</span>
                      <span className="font-mono text-slate-400">{count} events ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full ${
                          idx === 0
                            ? 'bg-cyan-500'
                            : idx === 1
                            ? 'bg-indigo-500'
                            : idx === 2
                            ? 'bg-sky-400'
                            : 'bg-slate-600'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* This Month's Top Rated Commercial Occasions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Top Opportunities This Month</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {thisMonthOpportunities.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => openEventDetail(ev)}
                  className="bg-slate-950 border border-slate-800/90 hover:border-cyan-600 rounded-xl p-3 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {ev.name}
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                      {ev.opportunityScore}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {ev.resolvedDate} • {ev.category}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('niches')}
              className="w-full text-center py-2 mt-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 transition-colors"
            >
              Explore All Niche Strategies →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
