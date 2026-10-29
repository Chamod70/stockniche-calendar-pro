import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
  Flame,
  FolderPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ResolvedEvent } from '../../types';

export const SeasonalPlanner: React.FC = () => {
  const { allResolvedEvents, openEventDetail, discoverNichesForEvent, addProject, setActiveTab } = useApp();

  const [timeHorizon, setTimeHorizon] = useState<'7' | '30' | '90' | '180' | '365'>('90');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter events by selected time horizon
  const horizonEvents = useMemo(() => {
    const daysLimit = parseInt(timeHorizon, 10);
    return allResolvedEvents
      .filter((ev) => {
        if (ev.daysRemaining < 0 || ev.daysRemaining > daysLimit) return false;
        if (selectedCategory !== 'All' && ev.category !== selectedCategory) return false;
        return true;
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [allResolvedEvents, timeHorizon, selectedCategory]);

  // Production Milestone Stages
  const milestoneStages = [
    { name: '1. Trend & Concept Research', weeksBefore: 12, desc: 'Analyze existing top seller gaps and buyer intent keywords' },
    { name: '2. Asset Production & Variations', weeksBefore: 8, desc: 'Create 8-16 variations with generous negative copy-space' },
    { name: '3. Technical & QC Verification', weeksBefore: 6, desc: 'Verify vector bezier paths, remove ghost rasters, check releases' },
    { name: '4. Adobe Stock Submission Target', weeksBefore: 4, desc: 'Upload EPS/JPG/Video before moderator review queues lengthen' },
    { name: '5. Peak Commercial Buyer Search', weeksBefore: 0, desc: 'Event occurs; marketing teams download holiday graphics' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                Seasonal Production Radar
              </span>
              <span className="text-xs text-slate-400">Microstock Lead Time Optimizer</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Annual Production Planner & Milestones
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Stock assets require 4 to 8 weeks for review, indexing, and corporate buyer discovery prior to holiday dates. Plan your creative sprints using verified production lead times.
            </p>
          </div>

          {/* Time Horizon Pills */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            {[
              { id: '7', label: '7 Days' },
              { id: '30', label: '30 Days' },
              { id: '90', label: '90 Days' },
              { id: '180', label: '6 Months' },
              { id: '365', label: '12 Months' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeHorizon(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeHorizon === tab.id
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Milestone Blueprint Visual */}
        <div className="pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
            Standard Adobe Stock Production Timeline
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            {milestoneStages.map((stage, idx) => (
              <div
                key={stage.name}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 relative"
              >
                <span className="text-[10px] font-mono font-bold text-amber-400 block">
                  {stage.weeksBefore > 0 ? `${stage.weeksBefore} wks before event` : 'Event Day'}
                </span>
                <h4 className="text-xs font-bold text-slate-200">{stage.name}</h4>
                <p className="text-[10px] text-slate-500 leading-tight">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events in this horizon */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Opportunities in Next {timeHorizon} Days ({horizonEvents.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {horizonEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold block">
                      {ev.resolvedDate} ({ev.dayOfWeek})
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{ev.name}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                      ev.daysRemaining <= 14
                        ? 'bg-rose-950 border-rose-800 text-rose-300'
                        : ev.daysRemaining <= 45
                        ? 'bg-amber-950 border-amber-800 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {ev.daysRemaining} days left
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ev.description}
                </p>

                {/* Milestone Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Recommended Prep Target:</span>
                    <span className="font-mono text-amber-400 font-bold">{ev.recommendedPreparationDate}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(15, 100 - (ev.daysRemaining / (ev.typicalPreparationWeeks * 7)) * 100))}%`,
                      }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Asset Types pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ev.bestAssetTypes.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEventDetail(ev)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                >
                  View Details
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => discoverNichesForEvent(ev)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs transition-colors cursor-pointer"
                    title="Discover Niches"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      addProject({
                        name: `${ev.name} Sprint`,
                        eventName: ev.name,
                        targetMarket: ev.countries.includes('Global') ? 'Global' : ev.countries[0],
                        assetCategory: ev.bestAssetTypes[0] || 'Vector',
                        plannedQuantity: 10,
                        priority: ev.commercialValue === 'Extreme' ? 'Urgent' : 'High',
                        startDate: new Date().toISOString().slice(0, 10),
                        deadline: ev.recommendedPreparationDate,
                        status: 'Planned',
                        notes: `Sprint for ${ev.name}`,
                        prompts: [],
                        keywords: ev.tags,
                        checklist: [
                          { id: '1', text: 'Draft asset sketches / compositions', completed: false },
                          { id: '2', text: 'Export compliant vectors/footage', completed: false },
                        ],
                      });
                      setActiveTab('projects');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Plan Sprint</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
