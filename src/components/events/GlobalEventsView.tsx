import React, { useState, useMemo } from 'react';
import {
  Globe2,
  Search,
  Filter,
  Download,
  Calendar,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ResolvedEvent, TargetCountry, AssetType } from '../../types';
import { exportEventsToCSV } from '../../utils/exportHelpers';

export const GlobalEventsView: React.FC = () => {
  const {
    filteredEvents,
    openEventDetail,
    discoverNichesForEvent,
    countryFilter,
    setCountryFilter,
    assetTypeFilter,
    setAssetTypeFilter,
    selectedCategories,
    toggleCategoryFilter,
    clearCategoryFilters,
    searchQuery,
    setSearchQuery,
    showToast,
  } = useApp();

  const [sortField, setSortField] = useState<'date' | 'score' | 'name'>('date');
  const [selectedMonth, setSelectedMonth] = useState<number | 'All'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const processedEvents = useMemo(() => {
    let list = [...filteredEvents];

    if (selectedMonth !== 'All') {
      list = list.filter((e) => e.resolvedMonth === selectedMonth);
    }

    if (sortField === 'date') {
      list.sort((a, b) => a.resolvedDate.localeCompare(b.resolvedDate));
    } else if (sortField === 'score') {
      list.sort((a, b) => b.opportunityScore - a.opportunityScore);
    } else if (sortField === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [filteredEvents, selectedMonth, sortField]);

  const handleExportCSV = () => {
    if (processedEvents.length === 0) {
      showToast('No events to export in current filter', 'warning');
      return;
    }
    exportEventsToCSV(processedEvents);
    showToast('Exported events calendar to CSV!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Verified Global Database
              </span>
              <span className="text-xs text-slate-400">Statutory, Cultural & Commercial Occasions</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Global Special Days & Holiday Database
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Search and filter authoritative holidays and retail events across the US, UK, Europe, Asia, Sri Lanka, and international UN observances.
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

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  viewMode === 'cards' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  viewMode === 'table' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          {/* Search text input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, tag, festival..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value === 'All' ? 'All' : Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Months (12 Months)</option>
            {monthNames.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Country selector */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Geographies</option>
            <option value="Global">Global Observances</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Sri Lanka">Sri Lanka</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="China">China</option>
            <option value="India">India</option>
            <option value="Japan">Japan</option>
          </select>

          {/* Sort order */}
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="date">Sort by Date (Chronological)</option>
            <option value="score">Sort by Opportunity Score</option>
            <option value="name">Sort by Alphabetical Name</option>
          </select>
        </div>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <strong className="text-white">{processedEvents.length}</strong> matching events
        </span>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => openEventDetail(ev)}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-600/70 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 cursor-pointer transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">
                      {ev.resolvedDate}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">({ev.dayOfWeek})</span>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {ev.opportunityScore}/100
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {ev.name}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ev.description}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    {ev.category}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {ev.countries.slice(0, 2).join(', ')}
                  </span>
                  {ev.commercialValue === 'Extreme' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-semibold">
                      Extreme Demand
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {ev.daysRemaining >= 0 ? `${ev.daysRemaining} days left` : 'Passed this year'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    discoverNichesForEvent(ev);
                  }}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold group-hover:translate-x-1 transition-transform"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discover Niches →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Geography</th>
                  <th className="py-3 px-4">Commercial Tier</th>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {processedEvents.map((ev) => (
                  <tr
                    key={ev.id}
                    onClick={() => openEventDetail(ev)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-cyan-400 whitespace-nowrap">
                      {ev.resolvedDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                      {ev.name}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {ev.category}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {ev.countries.slice(0, 2).join(', ')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          ev.commercialValue === 'Extreme'
                            ? 'bg-rose-950 border-rose-800 text-rose-300'
                            : ev.commercialValue === 'High'
                            ? 'bg-amber-950 border-amber-800 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {ev.commercialValue}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {ev.opportunityScore}/100
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          discoverNichesForEvent(ev);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-semibold"
                      >
                        Niches
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
