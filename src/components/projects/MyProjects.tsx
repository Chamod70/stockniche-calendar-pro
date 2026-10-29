import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  AlertCircle,
  Tag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContributorProject, ProjectStatus, TargetCountry, AssetType } from '../../types';
import { exportProjectsToCSV } from '../../utils/exportHelpers';

const STATUS_COLUMNS: ProjectStatus[] = [
  'Idea',
  'Planned',
  'In Production',
  'Quality Review',
  'Ready for Submission',
  'Submitted',
  'Published',
];

export const MyProjects: React.FC = () => {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    allResolvedEvents,
    showToast,
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<ContributorProject | null>(null);

  // New Project Form State
  const [formName, setFormName] = useState<string>('');
  const [formEvent, setFormEvent] = useState<string>(allResolvedEvents[0]?.name || '');
  const [formTargetMarket, setFormTargetMarket] = useState<TargetCountry>('Global');
  const [formAssetCategory, setFormAssetCategory] = useState<AssetType>('Vector');
  const [formQuantity, setFormQuantity] = useState<number>(10);
  const [formPriority, setFormPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');
  const [formDeadline, setFormDeadline] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [formNotes, setFormNotes] = useState<string>('');

  const filteredProjects = useMemo(() => {
    if (statusFilter === 'All') return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter a project name', 'warning');
      return;
    }

    addProject({
      name: formName,
      eventName: formEvent,
      targetMarket: formTargetMarket,
      assetCategory: formAssetCategory,
      plannedQuantity: formQuantity,
      priority: formPriority,
      startDate: new Date().toISOString().slice(0, 10),
      deadline: formDeadline,
      status: 'Planned',
      notes: formNotes,
      prompts: [],
      keywords: [],
      checklist: [
        { id: '1', text: 'Visual market research & moodboard', completed: false },
        { id: '2', text: `Create ${formQuantity} distinct asset variations`, completed: false },
        { id: '3', text: 'Inspect paths, eliminate stray points & ghost rasters', completed: false },
        { id: '4', text: 'Generate title, 25-35 keywords, and submit to Adobe Stock', completed: false },
      ],
    });

    setIsCreateModalOpen(false);
    setFormName('');
    setFormNotes('');
  };

  const toggleChecklistItem = (projectId: string, checklistId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const updatedChecklist = proj.checklist.map((c) =>
      c.id === checklistId ? { ...c, completed: !c.completed } : c
    );
    updateProject(projectId, { checklist: updatedChecklist });
  };

  const handleStatusChange = (projectId: string, newStatus: ProjectStatus) => {
    updateProject(projectId, { status: newStatus });
  };

  const handleExportCSV = () => {
    if (projects.length === 0) {
      showToast('No projects to export yet', 'warning');
      return;
    }
    exportProjectsToCSV(projects);
    showToast('Exported projects to CSV!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Production Kanban
              </span>
              <span className="text-xs text-slate-400">Microstock Contributor Pipeline</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Personal Content Production Planner
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Track your asset creation from concept and research through production, technical quality-control, and submission to Adobe Stock.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                List
              </button>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/60 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80 text-xs overflow-x-auto pb-1">
          <span className="text-slate-400 mr-2 font-medium">Filter Status:</span>
          {['All', ...STATUS_COLUMNS].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((colStatus) => {
            const colProjects = projects.filter((p) => p.status === colStatus);

            return (
              <div
                key={colStatus}
                className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col space-y-3 min-w-[280px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        colStatus === 'In Production'
                          ? 'bg-amber-400 animate-pulse'
                          : colStatus === 'Published'
                          ? 'bg-emerald-400'
                          : colStatus === 'Ready for Submission'
                          ? 'bg-cyan-400'
                          : 'bg-slate-500'
                      }`}
                    />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {colStatus}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 font-bold">
                    {colProjects.length}
                  </span>
                </div>

                {/* Cards in Column */}
                <div className="space-y-3 flex-1">
                  {colProjects.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-800/80 text-center text-[11px] text-slate-500">
                      No assets in {colStatus}
                    </div>
                  ) : (
                    colProjects.map((p) => {
                      const completedCount = p.checklist.filter((c) => c.completed).length;
                      const isPastDeadline = new Date(p.deadline) < new Date();

                      return (
                        <div
                          key={p.id}
                          className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-3 shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                              {p.assetCategory} ({p.plannedQuantity} pcs)
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                p.priority === 'Urgent'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {p.priority}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white leading-snug">
                            {p.name}
                          </h4>

                          <div className="text-[11px] text-slate-400 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-cyan-400" />
                              <span>{p.eventName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span className={isPastDeadline ? 'text-rose-400 font-bold' : ''}>
                                Deadline: {p.deadline}
                              </span>
                            </div>
                          </div>

                          {/* Checklist preview */}
                          {p.checklist.length > 0 && (
                            <div className="pt-2 border-t border-slate-900 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>QC Checklist</span>
                                <span className="font-mono text-cyan-400">
                                  {completedCount}/{p.checklist.length}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {p.checklist.slice(0, 2).map((chk) => (
                                  <div
                                    key={chk.id}
                                    onClick={() => toggleChecklistItem(p.id, chk.id)}
                                    className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer hover:text-white"
                                  >
                                    {chk.completed ? (
                                      <CheckSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                    ) : (
                                      <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    )}
                                    <span className={`truncate ${chk.completed ? 'line-through text-slate-500' : ''}`}>
                                      {chk.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quick Next-Status Selector */}
                          <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-1">
                            <select
                              value={p.status}
                              onChange={(e) => handleStatusChange(p.id, e.target.value as any)}
                              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-cyan-300 font-semibold focus:outline-none"
                            >
                              {STATUS_COLUMNS.map((st) => (
                                <option key={st} value={st}>
                                  Move to {st}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => deleteProject(p.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Target Market</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{p.name}</span>
                      <span className="text-[11px] text-slate-400">{p.plannedQuantity} planned assets</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{p.eventName}</td>
                    <td className="py-3 px-4 text-cyan-400">{p.assetCategory}</td>
                    <td className="py-3 px-4 text-slate-400">{p.targetMarket}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{p.deadline}</td>
                    <td className="py-3 px-4">
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.id, e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-cyan-300 font-semibold"
                      >
                        {STATUS_COLUMNS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteProject(p.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create New Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>Create Contributor Project Sprint</span>
            </h3>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Project Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Easter Holiday 3D Isometric Icon Pack"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Related Occasion</label>
                  <select
                    value={formEvent}
                    onChange={(e) => setFormEvent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {allResolvedEvents.map((e) => (
                      <option key={e.id} value={e.name}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Target Asset Type</label>
                  <select
                    value={formAssetCategory}
                    onChange={(e) => setFormAssetCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Vector">Vector</option>
                    <option value="Vector Icon Pack">Vector Icon Pack</option>
                    <option value="Stock Photography">Stock Photography</option>
                    <option value="Product Background">Product Background</option>
                    <option value="Stock Video">Stock Video Loop</option>
                    <option value="3D Render">3D Render Asset</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Asset Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Target Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Production Notes & Concept Directives</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Composition direction, color scheme, copy-space staging..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
