import React, { useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  getDaysInMonth,
  formatDateString,
  isLeapYear,
} from '../../utils/dateCalculations';
import { ResolvedEvent } from '../../types';

export const MasterCalendar: React.FC = () => {
  const {
    currentYear,
    currentMonth,
    setYear,
    setMonth,
    calendarView,
    setCalendarView,
    goToToday,
    nextPeriod,
    prevPeriod,
    selectedDateStr,
    setSelectedDateStr,
    filteredEvents,
    allResolvedEvents,
    openEventDetail,
    selectedCategories,
    toggleCategoryFilter,
    countryFilter,
    setCountryFilter,
    assetTypeFilter,
    setAssetTypeFilter,
    resetAllFilters,
  } = useApp();

  const todayStr = useMemo(() => {
    const now = new Date();
    return formatDateString(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const categoriesList = [
    'International & UN',
    'National Holiday',
    'Religious & Cultural',
    'Commercial & Retail',
    'Seasonal & Nature',
    'Health & Awareness',
    'Technology & Innovation',
    'Food & Agriculture',
  ];

  // Map events to date strings for fast calendar lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, ResolvedEvent[]>();
    filteredEvents.forEach((ev) => {
      const existing = map.get(ev.resolvedDate) || [];
      existing.push(ev);
      map.set(ev.resolvedDate, existing);
    });
    return map;
  }, [filteredEvents]);

  // Days in current month grid
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonthWeekday = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sunday

  // Days from previous month to fill the first row
  const prevMonthIndex = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    return eventsByDate.get(selectedDateStr) || [];
  }, [eventsByDate, selectedDateStr]);

  const leapYearStatus = isLeapYear(currentYear);

  return (
    <div className="space-y-5">
      {/* Calendar Top Controls & Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Month / Year Title with Jump Controls */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-cyan-400" />
              <span>{monthNames[currentMonth - 1]}</span>
              <span className="text-cyan-400 font-mono">{currentYear}</span>
            </h2>
            {leapYearStatus && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-mono">
                Leap Year
              </span>
            )}
          </div>

          {/* View Switcher: Day, Week, Month, Year */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              {(['month', 'week', 'day', 'year'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setCalendarView(view)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    calendarView === view
                      ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-900/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            <button
              onClick={goToToday}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Quick Category & Country Filters */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 mr-1 font-medium">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filters:</span>
          </div>

          {/* Country Dropdown */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Countries</option>
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

          {/* Categories Pill toggles */}
          {categoriesList.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-600 font-semibold shadow-xs'
                    : 'bg-slate-950/70 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            );
          })}

          {(selectedCategories.length > 0 || countryFilter !== 'All') && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-rose-400 hover:text-rose-300 ml-auto underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Calendar Display */}
      {calendarView === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Month Grid (3 cols on desktop) */}
          <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/70 text-center py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span className="text-rose-400/80">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-cyan-400/80">Sat</span>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 auto-rows-fr gap-px bg-slate-800/60">
              {/* Prev month overflow days */}
              {Array.from({ length: firstDayOfMonthWeekday }).map((_, i) => {
                const dayNum = daysInPrevMonth - firstDayOfMonthWeekday + i + 1;
                const prevDateStr = formatDateString(prevMonthYear, prevMonthIndex, dayNum);
                const prevDayEvents = eventsByDate.get(prevDateStr) || [];
                return (
                  <div
                    key={`prev-${dayNum}`}
                    onClick={() => {
                      setSelectedDateStr(prevDateStr);
                      setMonth(prevMonthIndex);
                      if (currentMonth === 1) setYear(prevMonthYear);
                    }}
                    className="min-h-[105px] bg-slate-950/40 p-2 cursor-pointer hover:bg-slate-900/60 transition-colors opacity-40"
                  >
                    <span className="text-xs font-mono text-slate-500">{dayNum}</span>
                    {prevDayEvents.length > 0 && (
                      <div className="mt-1 space-y-1">
                        <span className="text-[10px] block truncate text-slate-400">
                          {prevDayEvents[0].name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Current month days */}
              {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = formatDateString(currentYear, currentMonth, dayNum);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDateStr;
                const dayEvents = eventsByDate.get(dateStr) || [];
                const hasExtremeCommercial = dayEvents.some((e) => e.commercialValue === 'Extreme');
                const hasUrgent = dayEvents.some((e) => e.daysRemaining >= 0 && e.daysRemaining <= 30);

                return (
                  <div
                    key={`cur-${dayNum}`}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[105px] p-2 flex flex-col justify-between transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-slate-900 border-2 border-cyan-500 shadow-lg shadow-cyan-950/60 z-10'
                        : isToday
                        ? 'bg-slate-900/90 border border-cyan-500/40'
                        : 'bg-slate-950 hover:bg-slate-900/70'
                    }`}
                  >
                    {/* Date Number & Top Badges */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md shadow-cyan-500/50'
                            : isSelected
                            ? 'bg-slate-800 text-cyan-300'
                            : 'text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {/* Event Count & Commercial Highlights */}
                      <div className="flex items-center gap-1">
                        {hasExtremeCommercial && (
                          <span
                            title="Extreme commercial microstock demand"
                            className="w-2 h-2 rounded-full bg-rose-500 animate-ping"
                          />
                        )}
                        {dayEvents.length > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Event badges on day cell */}
                    <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEventDetail(ev);
                          }}
                          className={`text-[10px] leading-tight px-1.5 py-1 rounded truncate border font-medium transition-transform hover:scale-[1.02] ${
                            ev.commercialValue === 'Extreme'
                              ? 'bg-rose-950/70 border-rose-800/70 text-rose-200'
                              : ev.category === 'Religious & Cultural'
                              ? 'bg-amber-950/70 border-amber-800/70 text-amber-200'
                              : ev.category === 'Commercial & Retail'
                              ? 'bg-emerald-950/70 border-emerald-800/70 text-emerald-200'
                              : 'bg-slate-800/90 border-slate-700/80 text-cyan-300'
                          }`}
                          title={`${ev.name} (${ev.category}) - Score: ${ev.opportunityScore}`}
                        >
                          {ev.name}
                        </div>
                      ))}

                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-medium pl-1 block">
                          +{dayEvents.length - 2} more...
                        </span>
                      )}
                    </div>

                    {/* Lead time alert bar if urgent */}
                    {hasUrgent && (
                      <div className="w-full h-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 mt-1" />
                    )}
                  </div>
                );
              })}

              {/* Next month padding */}
              {(() => {
                const totalCells = firstDayOfMonthWeekday + daysInCurrentMonth;
                const nextMonthPadding = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                const nextMonthIndex = currentMonth === 12 ? 1 : currentMonth + 1;
                const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

                return Array.from({ length: nextMonthPadding }).map((_, i) => {
                  const dayNum = i + 1;
                  const nextDateStr = formatDateString(nextYear, nextMonthIndex, dayNum);
                  return (
                    <div
                      key={`next-${dayNum}`}
                      onClick={() => {
                        setSelectedDateStr(nextDateStr);
                        setMonth(nextMonthIndex);
                        if (currentMonth === 12) setYear(nextYear);
                      }}
                      className="min-h-[105px] bg-slate-950/40 p-2 cursor-pointer hover:bg-slate-900/60 opacity-40"
                    >
                      <span className="text-xs font-mono text-slate-500">{dayNum}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Right Selected Date Detail Sidebar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-cyan-400" />
                    <span>{selectedDateStr}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedDateEvents.length} event{selectedDateEvents.length === 1 ? '' : 's'} on this date
                  </p>
                </div>

                {selectedDateStr === todayStr && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    TODAY
                  </span>
                )}
              </div>

              {/* Event Cards for Selected Date */}
              <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400">No major statutory or commercial events listed for this date.</p>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Try clicking another date or switch to <strong className="text-cyan-400">Seasonal Planner</strong> to view upcoming production deadlines.
                    </p>
                  </div>
                ) : (
                  selectedDateEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => openEventDetail(ev)}
                      className="bg-slate-950 border border-slate-800/90 hover:border-cyan-600/70 rounded-xl p-3 cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-950/40 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {ev.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                          {ev.opportunityScore}/100
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {ev.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                          {ev.countries.slice(0, 2).join(', ')}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          {ev.daysRemaining >= 0 ? `${ev.daysRemaining} days left` : 'Passed'}
                        </span>
                        <span className="text-cyan-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Research Niches →
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Tip: Submit stock assets 6-8 weeks before peak search demand.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Year View Matrix */}
      {calendarView === 'year' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {monthNames.map((mName, mIdx) => {
            const monthNumber = mIdx + 1;
            const monthEvents = allResolvedEvents.filter((e) => e.resolvedMonth === monthNumber);
            const extremeCount = monthEvents.filter((e) => e.commercialValue === 'Extreme').length;

            return (
              <div
                key={mName}
                onClick={() => {
                  setMonth(monthNumber);
                  setCalendarView('month');
                }}
                className="bg-slate-900/80 border border-slate-800 hover:border-cyan-600 rounded-xl p-4 cursor-pointer transition-all hover:shadow-xl group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300">
                    {mName}
                  </h3>
                  <span className="text-xs font-mono text-cyan-400 font-semibold">
                    {monthEvents.length} events
                  </span>
                </div>

                {extremeCount > 0 && (
                  <span className="text-[10px] font-semibold text-rose-300 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800/60 block w-fit mb-2">
                    {extremeCount} Mega Occasion{extremeCount === 1 ? '' : 's'}
                  </span>
                )}

                <div className="space-y-1.5 mt-2">
                  {monthEvents.slice(0, 3).map((e) => (
                    <div key={e.id} className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                      <span className="font-mono text-slate-500 text-[10px]">{e.resolvedDay}:</span>
                      <span className="truncate">{e.name}</span>
                    </div>
                  ))}
                  {monthEvents.length > 3 && (
                    <span className="text-[10px] text-slate-500 pl-3 block">
                      +{monthEvents.length - 3} more occasions
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Week / Day View simple switch */}
      {(calendarView === 'week' || calendarView === 'day') && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-white">
            {calendarView === 'week' ? `Week of ${selectedDateStr}` : `Day View: ${selectedDateStr}`}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Showing all {filteredEvents.filter(e => e.resolvedDate === selectedDateStr).length} scheduled commercial events and contributor milestones for this period.
          </p>
          <div className="max-w-2xl mx-auto space-y-3">
            {filteredEvents
              .filter((e) => calendarView === 'day' ? e.resolvedDate === selectedDateStr : e.resolvedMonth === currentMonth)
              .slice(0, 8)
              .map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => openEventDetail(ev)}
                  className="bg-slate-950 border border-slate-800 hover:border-cyan-600 rounded-xl p-3 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="text-left">
                    <span className="text-[10px] font-mono text-cyan-400">{ev.resolvedDate} ({ev.dayOfWeek})</span>
                    <h4 className="text-xs font-bold text-white">{ev.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{ev.description}</p>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold shrink-0">
                    Open Details
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
