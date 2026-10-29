import React, { useState, useEffect } from 'react';
import {
  Tag,
  Copy,
  Check,
  Download,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  ListOrdered,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KeywordMetadata, AssetType } from '../../types';
import { apiService } from '../../services/apiService';
import { exportToCSV } from '../../utils/exportHelpers';

export const KeywordAssistant: React.FC = () => {
  const { allResolvedEvents, showToast } = useApp();

  const [selectedEventId, setSelectedEventId] = useState<string>(() => allResolvedEvents[0]?.id || '');
  const [assetType, setAssetType] = useState<AssetType>('Vector');
  const [conceptNotes, setConceptNotes] = useState<string>('Celebration banner with copy space and decorative elements');
  const [metadata, setMetadata] = useState<KeywordMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const currentEvent = allResolvedEvents.find((e) => e.id === selectedEventId) || allResolvedEvents[0];

  const handleGenerate = async () => {
    if (!currentEvent) return;
    setIsLoading(true);
    try {
      const res = await apiService.generateKeywords({
        eventName: currentEvent.name,
        concept: conceptNotes,
        assetType,
        targetCountry: currentEvent.countries[0] || 'Global',
      });
      setMetadata(res);
      showToast('Generated Adobe Stock metadata & keywords!', 'success');
    } catch (err) {
      showToast('Error generating keywords', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!metadata && currentEvent) {
      handleGenerate();
    }
  }, [selectedEventId, assetType]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    showToast(`Copied ${label}!`, 'success');
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleExportCSV = () => {
    if (!metadata) return;
    const data = [
      {
        'Title': metadata.title,
        'Category': metadata.category,
        'All Keywords (Comma Separated)': metadata.allKeywords.join(', '),
        'Top 10 Keywords': metadata.allKeywords.slice(0, 10).join(', '),
        'Subject Keywords': metadata.keywordClusters.subject.join(', '),
        'Commercial Keywords': metadata.keywordClusters.concept.join(', '),
        'Style Keywords': metadata.keywordClusters.style.join(', '),
      },
    ];
    exportToCSV(data, `stock_metadata_${currentEvent?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    showToast('Exported metadata CSV!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Metadata & Search Intent
              </span>
              <span className="text-xs text-slate-400">Microstock Tagging & Compliance</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Adobe Stock Keyword & Metadata Assistant
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Adobe Stock search prioritizes the first 10 keywords. Generate relevant, non-spammy titles and keyword clusters without trademark violations or generic keyword stuffing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={!metadata}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/60 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Generating...' : 'Generate Metadata'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Target Occasion
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
              Asset Type
            </label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Vector">Vector Illustration</option>
              <option value="Vector Icon Pack">Vector Icon Pack</option>
              <option value="Stock Photography">Stock Photography</option>
              <option value="Product Background">Product Background</option>
              <option value="Stock Video">Stock Video Loop</option>
              <option value="3D Render">3D Render Asset</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Asset Visual Concept Notes
            </label>
            <input
              type="text"
              value={conceptNotes}
              onChange={(e) => setConceptNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Generated Metadata Display */}
      {metadata && (
        <div className="space-y-5">
          {/* Title Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Recommended Stock Title (Clean, Commercial, Max 70 Chars)
              </span>

              <button
                onClick={() => copyText(metadata.title, 'Title')}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                {copiedSection === 'Title' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'Title' ? 'Copied' : 'Copy Title'}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-semibold text-white font-mono">
              {metadata.title}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Category: <strong className="text-slate-200">{metadata.category}</strong></span>
              <span>Length: <strong className="text-cyan-400 font-mono">{metadata.title.length}</strong> / 70 characters</span>
            </div>
          </div>

          {/* Top 10 Priority Keywords (Crucial for Adobe Stock) */}
          <div className="bg-slate-900/90 border border-cyan-800/60 rounded-2xl p-5 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-cyan-400" />
                  <span>Top 10 Priority Keywords (Positions 1 to 10)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Adobe Stock search places the heaviest indexing weight on the first 10 keywords.
                </p>
              </div>

              <button
                onClick={() => copyText(metadata.allKeywords.slice(0, 10).join(', '), 'Top 10')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-950/50 cursor-pointer"
              >
                {copiedSection === 'Top 10' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'Top 10' ? 'Copied!' : 'Copy Top 10 Only'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {metadata.allKeywords.slice(0, 10).map((kw, idx) => (
                <span
                  key={kw}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/50 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-mono flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{kw}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Full Keywords Matrix (Clusters) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>All Recommended Keywords ({metadata.allKeywords.length} tags)</span>
              </h3>

              <button
                onClick={() => copyText(metadata.allKeywords.join(', '), 'All Keywords')}
                className="flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 font-semibold cursor-pointer"
              >
                {copiedSection === 'All Keywords' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'All Keywords' ? 'Copied All!' : 'Copy All as Comma-Separated'}</span>
              </button>
            </div>

            {/* Keyword Cluster categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Subject & Event ({metadata.keywordClusters.subject.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {metadata.keywordClusters.subject.map((k) => (
                    <span key={k} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[11px]">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Commercial Intent & Concept ({metadata.keywordClusters.concept.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {metadata.keywordClusters.concept.map((k) => (
                    <span key={k} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[11px]">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Visual Style & Technical ({metadata.keywordClusters.style.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {metadata.keywordClusters.style.map((k) => (
                    <span key={k} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[11px]">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Prohibited / Forbidden tags warning */}
            {metadata.forbiddenTags && metadata.forbiddenTags.length > 0 && (
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-200">Avoid these prohibited / spam tags: </strong>
                  <span>{metadata.forbiddenTags.join(', ')}</span>
                  <p className="text-[11px] text-rose-400/80 mt-0.5">
                    Using trademarked brands or unrelated buzzwords leads to asset rejection or account suspension on Adobe Stock.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
