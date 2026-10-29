/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MasterCalendar } from './components/calendar/MasterCalendar';
import { Dashboard } from './components/dashboard/Dashboard';
import { GlobalEventsView } from './components/events/GlobalEventsView';
import { NicheFinder } from './components/niches/NicheFinder';
import { PromptStudio } from './components/prompts/PromptStudio';
import { SeasonalPlanner } from './components/planner/SeasonalPlanner';
import { CountryExplorer } from './components/countries/CountryExplorer';
import { KeywordAssistant } from './components/keywords/KeywordAssistant';
import { MyProjects } from './components/projects/MyProjects';
import { ReportsAndExports } from './components/reports/ReportsAndExports';
import { Settings } from './components/settings/Settings';
import { ApiSettingsSidebar } from './components/settings/ApiSettingsSidebar';
import { EventDetailModal } from './components/events/EventDetailModal';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, toasts } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Workspace with Sidebar & Dynamic View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

        {/* Dynamic Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-950/50">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'calendar' && <MasterCalendar />}
            {activeTab === 'events' && <GlobalEventsView />}
            {activeTab === 'niches' && <NicheFinder />}
            {activeTab === 'prompts' && <PromptStudio />}
            {activeTab === 'planner' && <SeasonalPlanner />}
            {activeTab === 'countries' && <CountryExplorer />}
            {activeTab === 'keywords' && <KeywordAssistant />}
            {activeTab === 'projects' && <MyProjects />}
            {activeTab === 'reports' && <ReportsAndExports />}
            {activeTab === 'settings' && <Settings />}
          </div>
        </main>
      </div>

      {/* Global Event Detail Modal */}
      <EventDetailModal />

      {/* Gemini API Settings Slide-Over Sidebar */}
      <ApiSettingsSidebar />

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-xl border shadow-xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-800 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-800 text-amber-200'
                : 'bg-cyan-950/90 border-cyan-800 text-cyan-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
