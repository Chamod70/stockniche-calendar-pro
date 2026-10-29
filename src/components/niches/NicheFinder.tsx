import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Filter,
  Layers,
  ArrowUpDown,
  Download,
  FolderPlus,
  Terminal,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StockNiche, AssetType, ResolvedEvent } from '../../types';
import { exportNichesToCSV } from '../../utils/exportHelpers';

export const NicheFinder: React.FC = () => {
  const {
    allResolvedEvents,
    currentNiches,
    setCurrentNiches,
    isDiscoveringNiches,
    discoverNichesForEvent,
    setActiveTab,
    addProject,
    showToast,
  } = useApp();

  // Selected event for niche analysis
  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    return allResolvedEvents[0]?.id || '';
  });

  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | 'All'>('All');
  const [sortBy, setSortBy] = useState<'score' | 'competition' | 'complexity'>('score');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const currentEvent = useMemo(() => {
    return allResolvedEvents.find((e) => e.id === selectedEventId) || allResolvedEvents[0];
  }, [allResolvedEvents, selectedEventId]);

  // Trigger analysis if currentNiches is empty
  const handleAnalyze = () => {
    if (currentEvent) {
      discoverNichesForEvent(currentEvent);
    }
  };

  // Filter & sort discovered niches
  const processedNiches = useMemo(() => {
    let result = [...currentNiches];

    // Filter by asset type
    if (selectedAssetType !== 'All') {
      result = result.filter((n) => n.recommendedAssetType === selectedAssetType);
    }

    // Filter by text search
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      result = result.filter(
        (n) =>
          n.nicheName.toLowerCase().includes(q) ||
          n.specificConcept.toLowerCase().includes(q) ||
          n.intendedCommercialUse.toLowerCase().includes(q) ||
          n.suggestedKeywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'score') {
        return b.opportunityScore - a.opportunityScore;
      }
      if (sortBy === 'competition') {
        const compRank = { Low: 3, Medium: 2, High: 1 };
        return (compRank[b.competitionLevel] || 0) - (compRank[a.competitionLevel] || 0);
      }
      if (sortBy === 'complexity') {
        const compRank = { Low: 3, Medium: 2, High: 1 };
        return (compRank[a.productionComplexity] || 0) - (compRank[b.productionComplexity] || 0);
      }
      return 0;
    });

    return result;
  }, [currentNiches, selectedAssetType, searchFilter, sortBy]);

  const handleExportCSV = () => {
    if (currentNiches.length === 0) {
      showToast('No niches to export yet. Generate some niches first!', 'warning');
      return;
    }
    exportNichesToCSV(currentNiches, currentEvent?.name);
    showToast('Exported niches to CSV!', 'success');
  };

  const handleCreateProjectFromNiche = (niche: StockNiche) => {
    addProject({
      name: niche.nicheName,
      eventName: niche.eventName,
      targetMarket: (niche.targetMarket as any) || 'Global',
      assetCategory: niche.recommendedAssetType,
      plannedQuantity: niche.variationsRecommended || 8,
      priority: niche.creationPriority === 'Urgent' ? 'Urgent' : 'High',
      startDate: new Date().toISOString().slice(0, 10),
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'Planned',
      notes: `${niche.specificConcept}\n\nCommercial Use: ${niche.intendedCommercialUse}\nDifferentiation: ${niche.differentiationStrategy}`,
      prompts: [],
      keywords: niche.suggestedKeywords,
      checklist: [
        { id: '1', text: `Create ${niche.variationsRecommended} variations using ${niche.suggestedVisualStyle}`, completed: false },
        { id: '2', text: 'Ensure clean negative copy space for commercial buyers', completed: false },
        { id: '3', text: 'Verify metadata and zero trademark brand elements', completed: false },
      ],
      opportunityScore: niche.opportunityScore,
    });
    setActiveTab('projects');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Event Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
                AI Discovery Engine
              </span>
              <span className="text-xs text-slate-400">Microstock Commercial Opportunity Analysis</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Adobe Stock Commercial Niche Finder
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Uncover high-converting, differentiated content niches for any calendar event, complete with buyer profiles, visual art direction, and explainable opportunity scores.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isDiscoveringNiches}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-violet-950/60 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isDiscoveringNiches ? 'animate-spin' : ''}`} />
              <span>{isDiscoveringNiches ? 'Analyzing Event...' : 'Generate New Niches'}</span>
            </button>
          </div>
        </div>

        {/* Event Selector & Asset Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Target Calendar Occasion
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                const ev = allResolvedEvents.find((x) => x.id === e.target.value);
                if (ev) discoverNichesForEvent(ev);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {allResolvedEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.resolvedDate} - {ev.commercialValue})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Filter by Asset Type
            </label>
            <select
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Asset Types</option>
              <option value="Vector">Vector Illustration</option>
              <option value="Vector Icon Pack">Vector Icon Pack</option>
              <option value="Stock Photography">Stock Photography</option>
              <option value="Product Background">Product Background</option>
              <option value="Stock Video">Stock Video Loop</option>
              <option value="3D Render">3D Render Concept</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Sort Opportunities
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="score">Highest Opportunity Score (0-100)</option>
              <option value="competition">Lowest Contributor Competition</option>
              <option value="complexity">Easiest Production Effort</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discovered Niches Grid */}
      {isDiscoveringNiches ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">Analyzing Adobe Stock Search Trends & Commercial Demand</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Synthesizing buyer profiles, commercial licensing intent, and visual differentiation parameters for {currentEvent?.name}...
          </p>
        </div>
      ) : processedNiches.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Niches Generated for {currentEvent?.name}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click "Generate New Niches" above to trigger AI and algorithmic commercial niche discovery.
          </p>
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors mt-2"
          >
            Run Niche Analysis Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {processedNiches.map((niche) => (
            <div
              key={niche.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-600/70 rounded-2xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Title & Opportunity Score Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                      {niche.recommendedAssetType}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                      {niche.nicheName}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-black font-mono text-cyan-400">
                      {niche.opportunityScore}
                      <span className="text-xs text-slate-500 font-normal">/100</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block font-mono">Opportunity Index</span>
                  </div>
                </div>

                {/* Score Breakdown Radar */}
                {niche.scoreBreakdown && (
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Relevance</span>
                      <span className="text-xs font-bold font-mono text-slate-200">
                        {niche.scoreBreakdown.commercialRelevance}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Seasonal</span>
                      <span className="text-xs font-bold font-mono text-slate-200">
                        {niche.scoreBreakdown.seasonalDemand}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Diff.</span>
                      <span className="text-xs font-bold font-mono text-cyan-400">
                        {niche.scoreBreakdown.differentiationPotential}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Readiness</span>
                      <span className="text-xs font-bold font-mono text-emerald-400">
                        {niche.scoreBreakdown.marketReadiness}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Specific Concept */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Specific Asset Concept
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    {niche.specificConcept}
                  </p>
                </div>

                {/* Intended Commercial Use & Industries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Commercial Application</span>
                    <span className="text-slate-300 font-medium block truncate mt-0.5">
                      {niche.intendedCommercialUse}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Buyer Industries</span>
                    <span className="text-slate-300 font-medium block truncate mt-0.5">
                      {niche.potentialCustomerIndustries.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Differentiation Strategy (Anti-Saturation) */}
                <div className="bg-cyan-950/30 border border-cyan-800/50 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Differentiation & Saturation Advantage
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {niche.differentiationStrategy}
                  </p>
                </div>

                {/* Key metadata pills */}
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Priority: <strong className="text-white">{niche.creationPriority}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Competition: <strong className="text-white">{niche.competitionLevel}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Complexity: <strong className="text-white">{niche.productionComplexity}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Variations: <strong className="text-cyan-400">{niche.variationsRecommended} items</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setActiveTab('prompts');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Prompts</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('keywords');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Keywords</span>
                  </button>
                </div>

                <button
                  onClick={() => handleCreateProjectFromNiche(niche)}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-950/50"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Start Project</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
