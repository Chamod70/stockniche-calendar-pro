import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Sparkles,
  Copy,
  Bookmark,
  Check,
  Download,
  Edit3,
  Layers,
  Camera,
  Film,
  Shapes,
  Lightbulb,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StockPrompt, AssetType } from '../../types';
import { apiService } from '../../services/apiService';
import { exportPromptsToCSV } from '../../utils/exportHelpers';

export const PromptStudio: React.FC = () => {
  const {
    allResolvedEvents,
    favoritePrompts,
    toggleFavoritePrompt,
    isPromptFavorited,
    showToast,
  } = useApp();

  const [selectedEventId, setSelectedEventId] = useState<string>(() => allResolvedEvents[0]?.id || '');
  const [assetType, setAssetType] = useState<AssetType>('Vector');
  const [visualStyle, setVisualStyle] = useState<string>('Glossy Modern Microstock Art');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9 (Commercial Header)');
  const [customConcept, setCustomConcept] = useState<string>('');

  const [generatedPrompts, setGeneratedPrompts] = useState<StockPrompt[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editing modal state
  const [editingPrompt, setEditingPrompt] = useState<StockPrompt | null>(null);

  const currentEvent = allResolvedEvents.find((e) => e.id === selectedEventId) || allResolvedEvents[0];

  // Auto-generate initial prompts on mount or event switch
  const handleGenerate = async () => {
    if (!currentEvent) return;
    setIsGenerating(true);
    try {
      const results = await apiService.generatePrompts({
        eventName: currentEvent.name,
        concept: customConcept || `${currentEvent.name} celebration and marketing campaign elements`,
        assetType,
        visualStyle,
        orientation: aspectRatio,
      });
      setGeneratedPrompts(results);
      showToast(`Generated ${results.length} copy-ready stock prompts!`, 'success');
    } catch (err) {
      showToast('Error generating prompts', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (generatedPrompts.length === 0 && currentEvent) {
      handleGenerate();
    }
  }, [selectedEventId, assetType]);

  const copyToClipboard = (prompt: StockPrompt) => {
    navigator.clipboard.writeText(prompt.promptText);
    setCopiedId(prompt.id);
    showToast('Prompt copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleExportCSV = () => {
    const listToExport = generatedPrompts.length > 0 ? generatedPrompts : favoritePrompts;
    if (listToExport.length === 0) {
      showToast('No prompts to export yet', 'warning');
      return;
    }
    exportPromptsToCSV(listToExport, currentEvent?.name);
    showToast('Exported prompts to CSV!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Config Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                AI Prompt Studio
              </span>
              <span className="text-xs text-slate-400">Adobe Stock Compliant Prompt Engineering</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Microstock Generative Prompt Studio
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Generates rigorous prompts adhering to microstock standards: true vector specifications (clean paths, no raster artifacts, pure white background), commercial photo staging with negative copy-space, and seamless 6-second video loop directives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Prompts</span>
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/60 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Regenerate Prompts'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Occasion / Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {allResolvedEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.resolvedDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Target Asset Medium
            </label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Vector">Vector (Strict Vector Rules)</option>
              <option value="Vector Icon Pack">Vector Icon Pack (Grid layout)</option>
              <option value="Stock Photography">Stock Photography (Camera & Light)</option>
              <option value="Product Background">Product Mockup Background</option>
              <option value="Stock Video">Stock Video (6-sec seamless loop)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Art Direction & Aesthetic
            </label>
            <select
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Glossy Modern Microstock Art">Glossy Modern Microstock Art</option>
              <option value="Minimalist Flat Vector">Minimalist Flat Vector Duo-Tone</option>
              <option value="Soft 3D Clay Isometric">Soft 3D Clay Isometric Render</option>
              <option value="Warm Natural Lifestyle Staging">Warm Natural Lifestyle Staging</option>
              <option value="Editorial Atmospheric Luxury">Editorial Atmospheric Luxury</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Aspect Ratio / Framing
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="16:9 (Commercial Header)">16:9 (Commercial Header)</option>
              <option value="1:1 (Square Social Post)">1:1 (Square Social Post)</option>
              <option value="9:16 (Vertical Reel / Story)">9:16 (Vertical Reel / Story)</option>
              <option value="3:2 (Standard DSLR)">3:2 (Standard DSLR)</option>
            </select>
          </div>
        </div>

        {/* Custom concept optional tweak */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Custom Subject Modifier (Optional)
          </label>
          <input
            type="text"
            value={customConcept}
            onChange={(e) => setCustomConcept(e.target.value)}
            placeholder="e.g. Modern diverse young entrepreneurs celebrating in a bright loft office with confetti..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Prompts Cards */}
      <div className="space-y-4">
        {generatedPrompts.map((prompt) => {
          const isFav = isPromptFavorited(prompt.id);
          const isCopied = copiedId === prompt.id;

          return (
            <div
              key={prompt.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                    {prompt.assetType.includes('Vector') ? (
                      <Shapes className="w-4 h-4" />
                    ) : prompt.assetType.includes('Photo') ? (
                      <Camera className="w-4 h-4" />
                    ) : (
                      <Film className="w-4 h-4" />
                    )}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{prompt.title}</h3>
                    <span className="text-[11px] text-slate-400">
                      Format: <strong className="text-cyan-300">{prompt.type}</strong> • Event: {prompt.eventName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleFavoritePrompt(prompt)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isFav
                        ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={isFav ? 'Remove from favorites' : 'Save to favorite prompts'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setEditingPrompt(prompt)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Edit prompt text"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => copyToClipboard(prompt)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950/50'
                    }`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? 'Copied!' : 'Copy Prompt'}</span>
                  </button>
                </div>
              </div>

              {/* Main Prompt Box */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 font-mono text-xs text-slate-200 leading-relaxed relative group">
                <p className="select-all">{prompt.promptText}</p>
              </div>

              {/* Negative Prompt & Technical Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                    Negative / Prohibited Prompt
                  </span>
                  <p className="text-slate-400 font-mono text-[11px] leading-relaxed">
                    {prompt.negativePrompt}
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                    Technical Contributor Spec
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {prompt.technicalSpecs}
                  </p>
                </div>
              </div>

              {/* Submission Tip Footer */}
              {prompt.adobeStockSubmissionTip && (
                <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-indigo-200">
                  <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-indigo-300">Adobe Stock Contributor Guideline: </strong>
                    <span>{prompt.adobeStockSubmissionTip}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inline Prompt Editor Modal */}
      {editingPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-cyan-400" />
              <span>Edit Prompt Directive</span>
            </h3>

            <textarea
              rows={8}
              value={editingPrompt.promptText}
              onChange={(e) => setEditingPrompt({ ...editingPrompt, promptText: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingPrompt(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setGeneratedPrompts((prev) =>
                    prev.map((p) => (p.id === editingPrompt.id ? editingPrompt : p))
                  );
                  setEditingPrompt(null);
                  showToast('Prompt updated', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
