import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Globe2,
  Sparkles,
  Terminal,
  TrendingUp,
  MapPin,
  Tag,
  FolderGit2,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  BookmarkCheck,
  KeyRound,
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const {
    activeTab,
    setActiveTab,
    projects,
    favoritePrompts,
    allResolvedEvents,
    setIsApiSidebarOpen,
    hasGeminiKey,
  } = useApp();

  const urgentOpportunitiesCount = allResolvedEvents.filter(
    (e) => e.daysRemaining >= 0 && e.daysRemaining <= 30
  ).length;

  const navItems: { id: NavigationTab; label: string; icon: React.FC<any>; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Master Calendar', icon: Calendar },
    { id: 'events', label: 'Global Events', icon: Globe2 },
    { id: 'niches', label: 'Niche Discovery', icon: Sparkles, badge: 'AI', badgeColor: 'bg-violet-900/60 text-violet-300 border-violet-700/50' },
    { id: 'prompts', label: 'AI Prompt Studio', icon: Terminal, badge: favoritePrompts.length > 0 ? favoritePrompts.length : undefined },
    { id: 'planner', label: 'Seasonal Planner', icon: TrendingUp, badge: urgentOpportunitiesCount > 0 ? `${urgentOpportunitiesCount} urgent` : undefined, badgeColor: 'bg-amber-950/70 text-amber-300 border-amber-800/60' },
    { id: 'countries', label: 'Country Explorer', icon: MapPin },
    { id: 'keywords', label: 'Keyword Assistant', icon: Tag },
    { id: 'projects', label: 'My Projects', icon: FolderGit2, badge: projects.length },
    { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`border-r border-slate-800 bg-slate-950 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between px-2 py-1.5 mb-2">
          {!isCollapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-800/50 text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs text-white whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}

        {/* Direct Gemini API Key Drawer Trigger */}
        <button
          onClick={() => setIsApiSidebarOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-amber-300/90 hover:text-amber-200 hover:bg-amber-950/30 border border-transparent hover:border-amber-800/40 transition-all group relative cursor-pointer mt-1"
        >
          <KeyRound className="w-4 h-4 shrink-0 text-amber-400 transition-transform group-hover:scale-110" />
          {!isCollapsed && (
            <div className="flex items-center justify-between flex-1 overflow-hidden">
              <span className="truncate font-semibold">Gemini API Key</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${
                  hasGeminiKey
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                }`}
              >
                {hasGeminiKey ? 'Ready' : 'Setup'}
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs text-white whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Gemini API Settings
            </div>
          )}
        </button>
      </div>

      {/* Footer Contributor Status Card */}
      {!isCollapsed && (
        <div className="p-3 m-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Production Radar
            </span>
            <span className="text-[10px] font-mono font-medium text-cyan-400">Next 30 Days</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            <strong className="text-white">{urgentOpportunitiesCount}</strong> events requiring immediate asset submission for Adobe Stock review.
          </div>
          <button
            onClick={() => setActiveTab('planner')}
            className="w-full text-center py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-[11px] text-cyan-300 font-medium transition-colors cursor-pointer"
          >
            Open Production Roadmap →
          </button>
        </div>
      )}
    </aside>
  );
};
