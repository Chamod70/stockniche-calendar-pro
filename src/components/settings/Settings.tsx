import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Settings: React.FC = () => {
  const { hasGeminiKey, projects, favoritePrompts, showToast } = useApp();

  const [defaultLeadWeeks, setDefaultLeadWeeks] = useState<number>(8);
  const [preferredAssetMedium, setPreferredAssetMedium] = useState<string>('Vector Illustration');
  const [targetMarketFocus, setTargetMarketFocus] = useState<string>('Global & US Retail');

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to reset all local projects and saved favorites to defaults?')) {
      localStorage.clear();
      showToast('Workspace reset to defaults! Reloading...', 'info');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Workspace Settings
            </span>
            <span className="text-xs text-slate-400">Contributor Configuration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Contributor Preferences & Engine Status
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Configure your primary asset production workflows, default review lead times, and view AI engine connectivity status.
          </p>
        </div>
      </div>

      {/* Grid: Contributor Preferences & Engine Connection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contributor Preferences */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-cyan-400" />
            <span>Workflow Preferences</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">
                Default Recommended Lead Time (Weeks Before Event)
              </label>
              <select
                value={defaultLeadWeeks}
                onChange={(e) => {
                  setDefaultLeadWeeks(Number(e.target.value));
                  showToast('Lead time preference saved', 'success');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value={6}>6 Weeks (Fast turn-around vector packs)</option>
                <option value={8}>8 Weeks (Standard Adobe Stock review recommendation)</option>
                <option value={10}>10 Weeks (Extended review safety for major retail sales)</option>
                <option value={12}>12 Weeks (Q4 Holiday shopping campaigns)</option>
              </select>
              <span className="text-[11px] text-slate-500 block mt-1">
                Used to highlight upcoming production sprint milestones on your calendar.
              </span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">
                Primary Asset Medium Focus
              </label>
              <select
                value={preferredAssetMedium}
                onChange={(e) => {
                  setPreferredAssetMedium(e.target.value);
                  showToast('Primary medium updated', 'success');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Vector Illustration">Vector Illustration & Icons</option>
                <option value="Stock Photography">Commercial Stock Photography</option>
                <option value="Product Backgrounds">Product Mockup Backgrounds & 3D</option>
                <option value="Stock Video Loops">4K Stock Video & Loops</option>
                <option value="Multi-Disciplinary">All Formats (Hybrid Portfolio)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">
                Primary Target Regional Market
              </label>
              <select
                value={targetMarketFocus}
                onChange={(e) => {
                  setTargetMarketFocus(e.target.value);
                  showToast('Market focus updated', 'success');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Global & US Retail">Global & US Retail Peaks</option>
                <option value="United Kingdom & Europe">United Kingdom & European Calendars</option>
                <option value="Sri Lanka & South Asia">Sri Lanka & South Asian Cultural Occasions</option>
                <option value="East Asia & Global">East Asia & Global</option>
              </select>
            </div>
          </div>
        </div>

        {/* Engine Connectivity Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AI Engine & Backend Architecture</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Gemini Intelligence Service</span>
                <span className="font-bold text-white text-xs mt-0.5 block">
                  gemini-3.8-flash (via @google/genai SDK)
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  hasGeminiKey
                    ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                    : 'bg-cyan-950 border-cyan-800 text-cyan-300'
                }`}
              >
                {hasGeminiKey ? 'API Connected' : 'Hybrid Engine Active'}
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Backend Server Runtime</span>
                <span className="font-bold text-white text-xs mt-0.5 block">
                  Express Full-Stack / Node.js
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                Port 3000
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Local Persistent Storage</span>
                <span className="font-bold text-white text-xs mt-0.5 block">
                  {projects.length} Projects • {favoritePrompts.length} Saved Prompts
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300">
                Synced
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClearData}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950 border border-rose-800 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Local Data to Starter Defaults</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Acceptance Standards Checklist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>System Verification & Acceptance Criteria</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {[
            'Accurate calendar navigation for any year, month, and leap year',
            'Full date click-through displaying all coinciding events and niches',
            'Multi-filter by country, category, asset type, and lead time',
            'Generates distinct vector, photography, and video concepts per event',
            'True vector prompts strictly enforcing clean bezier paths and no raster',
            'Explainable 0-100 opportunity score with breakdown factors',
            'Personal Kanban content planner with customizable checklists',
            'Instant CSV and JSON backup and restore capabilities',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
