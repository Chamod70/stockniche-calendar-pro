import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Globe2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  FolderPlus,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssetType } from '../../types';

export const EventDetailModal: React.FC = () => {
  const {
    selectedEvent,
    isEventModalOpen,
    setIsEventModalOpen,
    discoverNichesForEvent,
    setActiveTab,
    addProject,
    allResolvedEvents,
  } = useApp();

  if (!isEventModalOpen || !selectedEvent) return null;

  // Nearby related events in the same month
  const nearbyEvents = allResolvedEvents
    .filter(
      (e) =>
        e.id !== selectedEvent.id &&
        e.resolvedMonth === selectedEvent.resolvedMonth &&
        Math.abs(e.resolvedDay - selectedEvent.resolvedDay) <= 7
    )
    .slice(0, 3);

  const handleCreateProject = () => {
    addProject({
      name: `${selectedEvent.name} Contributor Kit`,
      eventName: selectedEvent.name,
      eventDate: selectedEvent.resolvedDate,
      targetMarket: selectedEvent.countries.includes('Global') ? 'Global' : selectedEvent.countries[0],
      assetCategory: selectedEvent.bestAssetTypes[0] || 'Vector',
      plannedQuantity: 10,
      priority: selectedEvent.commercialValue === 'Extreme' ? 'Urgent' : 'High',
      startDate: new Date().toISOString().slice(0, 10),
      deadline: selectedEvent.recommendedPreparationDate,
      status: 'Planned',
      notes: `Targeting ${selectedEvent.name}. Commercial value: ${selectedEvent.commercialValue}. Recommended asset types: ${selectedEvent.bestAssetTypes.join(', ')}.`,
      prompts: [],
      keywords: selectedEvent.tags,
      checklist: [
        { id: 'c1', text: 'Analyze top 20 existing Adobe Stock assets for saturation', completed: false },
        { id: 'c2', text: 'Design 10 differentiated variations with generous copy space', completed: false },
        { id: 'c3', text: 'Vectorize paths or color grade high-res captures', completed: false },
        { id: 'c4', text: 'Generate compliance metadata and submit for review', completed: false },
      ],
      opportunityScore: selectedEvent.opportunityScore,
    });
    setIsEventModalOpen(false);
    setActiveTab('projects');
  };

  const handleDiscoverNiches = () => {
    setIsEventModalOpen(false);
    discoverNichesForEvent(selectedEvent);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-b border-slate-800 p-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                {selectedEvent.category}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  selectedEvent.commercialValue === 'Extreme'
                    ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                    : selectedEvent.commercialValue === 'High'
                    ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {selectedEvent.commercialValue} Commercial Value
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {selectedEvent.confirmationStatus}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {selectedEvent.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1.5 font-mono text-cyan-300">
                <Calendar className="w-4 h-4 text-cyan-400" />
                {selectedEvent.resolvedDate} ({selectedEvent.dayOfWeek})
              </span>
              <span className="flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-indigo-400" />
                {selectedEvent.countries.join(', ')}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEventModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block font-medium">Opportunity Score</span>
              <div className="text-2xl font-black font-mono text-cyan-400 mt-1 flex items-baseline gap-1">
                {selectedEvent.opportunityScore}
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Commercial Index</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block font-medium">Days Remaining</span>
              <div
                className={`text-2xl font-black font-mono mt-1 ${
                  selectedEvent.daysRemaining <= 30 && selectedEvent.daysRemaining >= 0
                    ? 'text-rose-400'
                    : selectedEvent.daysRemaining < 0
                    ? 'text-slate-500'
                    : 'text-amber-400'
                }`}
              >
                {selectedEvent.daysRemaining >= 0 ? selectedEvent.daysRemaining : 'Passed'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {selectedEvent.daysRemaining >= 0 ? 'Days to occasion' : 'For next annual cycle'}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block font-medium">Recommended Prep</span>
              <div className="text-xs font-bold font-mono text-slate-200 mt-2">
                {selectedEvent.recommendedPreparationDate}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {selectedEvent.typicalPreparationWeeks} wks ahead
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block font-medium">Production Window</span>
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 border ${
                  selectedEvent.preparationStatus === 'Immediate Action Needed'
                    ? 'bg-rose-950 border-rose-800 text-rose-300'
                    : selectedEvent.preparationStatus === 'Ideal Production Window'
                    ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {selectedEvent.preparationStatus}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Event Context & Stock Significance
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
              {selectedEvent.description}
            </p>
          </div>

          {/* Best Asset Types */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Highest-Converting Asset Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedEvent.bestAssetTypes.map((type) => (
                <span
                  key={type}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Recurrence & Official Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-950 border border-slate-800 rounded-xl p-3.5">
            <div>
              <span className="text-slate-500 block text-[11px]">Recurrence Pattern</span>
              <span className="text-slate-200 font-medium">{selectedEvent.recurrenceRule || 'Annual'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Official Reference Source</span>
              {selectedEvent.sourceUrl ? (
                <a
                  href={selectedEvent.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 mt-0.5"
                >
                  <span>{selectedEvent.officialSource || 'Official Documentation'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-300 font-medium">{selectedEvent.officialSource || 'Standard Global Calendar'}</span>
              )}
            </div>
          </div>

          {/* Nearby Events */}
          {nearbyEvents.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Related & Nearby Occasions (Same Week)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {nearbyEvents.map((nb) => (
                  <div
                    key={nb.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <span className="text-[10px] font-mono text-cyan-400 block">{nb.resolvedDate}</span>
                    <span className="font-semibold text-slate-200 block truncate mt-0.5">{nb.name}</span>
                    <span className="text-[10px] text-slate-500 block">{nb.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              setIsEventModalOpen(false);
              setActiveTab('keywords');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Keywords</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add to Planner</span>
            </button>

            <button
              onClick={handleDiscoverNiches}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/40 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Discover AI Niches</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
