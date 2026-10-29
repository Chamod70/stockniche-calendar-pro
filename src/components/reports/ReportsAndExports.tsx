import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  Database,
  FolderGit2,
  Sparkles,
  Terminal,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  exportEventsToCSV,
  exportProjectsToCSV,
  exportPromptsToCSV,
  exportNichesToCSV,
  exportBackupJSON,
  parseBackupJSON,
  downloadFile,
} from '../../utils/exportHelpers';

export const ReportsAndExports: React.FC = () => {
  const {
    allResolvedEvents,
    projects,
    favoritePrompts,
    currentNiches,
    showToast,
    currentYear,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackupAll = () => {
    exportBackupJSON({
      projects,
      favoritePrompts,
      userSettings: { version: '1.0.0', exportedAt: new Date().toISOString() },
    });
    showToast('Downloaded complete JSON backup of projects and favorite prompts!', 'success');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseBackupJSON(text);

        if (parsed.projects && Array.isArray(parsed.projects)) {
          localStorage.setItem('stockniche_pro_projects_v1', JSON.stringify(parsed.projects));
        }
        if (parsed.favoritePrompts && Array.isArray(parsed.favoritePrompts)) {
          localStorage.setItem('stockniche_pro_favorites_v1', JSON.stringify(parsed.favoritePrompts));
        }

        showToast('Backup restored successfully! Refreshing...', 'success');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        showToast('Invalid backup JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handlePrintCalendar = () => {
    window.print();
  };

  const handleExportAnnualSummaryMarkdown = () => {
    let md = `# StockNiche Pro — ${currentYear} Annual Microstock Production Plan\n\n`;
    md += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    md += `## 1. Executive Summary\n`;
    md += `- Total Annual Occasions Tracked: ${allResolvedEvents.length}\n`;
    md += `- Mega Commercial Events: ${allResolvedEvents.filter((e) => e.commercialValue === 'Extreme').length}\n`;
    md += `- Personal Planned Projects: ${projects.length}\n\n`;

    md += `## 2. Chronological Calendar of Events\n\n`;
    md += `| Date | Event | Category | Geography | Commercial Tier | Score |\n`;
    md += `| --- | --- | --- | --- | --- | --- |\n`;
    allResolvedEvents.forEach((e) => {
      md += `| ${e.resolvedDate} | ${e.name} | ${e.category} | ${e.countries.join(', ')} | ${e.commercialValue} | ${e.opportunityScore}/100 |\n`;
    });

    downloadFile(md, `StockNiche_Production_Plan_${currentYear}.md`, 'text/markdown;charset=utf-8;');
    showToast('Downloaded Annual Summary Report (Markdown)!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Data Management & Backup
            </span>
            <span className="text-xs text-slate-400">CSV & JSON Exporters</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Reports, Data Export & Backup Center
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Download your content schedules, export prompt packs to CSV for batch processing, print seasonal wall calendars, and back up your project sprints.
          </p>
        </div>
      </div>

      {/* 4 Card Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tile 1: Master Calendar & Events CSV */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Full Event Calendar Export (CSV)</h3>
                <span className="text-[11px] text-slate-400">
                  {allResolvedEvents.length} verified events with dates, sources, and opportunity scores
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              Includes event dates, day of the week, country coverage, official reference links, commercial tiers, and recommended submission lead-time dates.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                exportEventsToCSV(allResolvedEvents);
                showToast('Exported events calendar to CSV!', 'success');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-950/50"
            >
              <Download className="w-4 h-4" />
              <span>Download Events CSV</span>
            </button>
            <button
              onClick={handleExportAnnualSummaryMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Markdown Report</span>
            </button>
          </div>
        </div>

        {/* Tile 2: Personal Projects Export */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">My Projects & Sprints (CSV)</h3>
                <span className="text-[11px] text-slate-400">
                  {projects.length} planned contributor projects
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              Exports your project names, target dates, deadlines, asset categories, planned quantities, statuses, and checklist progress to a spreadsheet.
            </p>
          </div>

          <button
            onClick={() => {
              if (projects.length === 0) {
                showToast('No projects to export yet', 'warning');
                return;
              }
              exportProjectsToCSV(projects);
              showToast('Exported projects to CSV!', 'success');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-950/50 w-fit"
          >
            <Download className="w-4 h-4" />
            <span>Download Projects CSV</span>
          </button>
        </div>

        {/* Tile 3: AI Prompts & Favorite Directives */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-800 flex items-center justify-center text-violet-400 shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Prompt Pack Export</h3>
                <span className="text-[11px] text-slate-400">
                  {favoritePrompts.length} saved prompts in library
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              Export copy-ready prompts, negative prompts, technical aspect ratios, and contributor guidelines to CSV for bulk generation tools.
            </p>
          </div>

          <button
            onClick={() => {
              if (favoritePrompts.length === 0) {
                showToast('Save some prompts to favorites first!', 'warning');
                return;
              }
              exportPromptsToCSV(favoritePrompts);
              showToast('Exported prompt library to CSV!', 'success');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-violet-950/50 w-fit"
          >
            <Download className="w-4 h-4" />
            <span>Download Favorite Prompts CSV</span>
          </button>
        </div>

        {/* Tile 4: Complete JSON Backup & Restore */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Complete System Backup & Restore</h3>
                <span className="text-[11px] text-slate-400">
                  Full snapshot of projects, checklists, and preferences
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              Back up your entire StockNiche workspace to a single portable JSON file, and restore it anytime on any browser or device.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleBackupAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-950/50"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Backup</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Restore Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Calendar Summary banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Printable Wall Calendar & PDF View</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Format current month and year view for high-contrast printable summary or PDF printout.
          </p>
        </div>

        <button
          onClick={handlePrintCalendar}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Current View</span>
        </button>
      </div>
    </div>
  );
};
