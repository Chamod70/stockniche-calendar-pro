import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  X,
  Clipboard,
  Eye,
  EyeOff,
  Check,
  Zap,
  Info,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService, ConnectionTestResult } from '../../services/apiService';

export const ApiSettingsSidebar: React.FC = () => {
  const {
    isApiSidebarOpen,
    setIsApiSidebarOpen,
    geminiApiKey,
    saveGeminiApiKey,
    removeGeminiApiKey,
    restoreDefaultGeminiApiKey,
    hasGeminiKey,
    showToast,
  } = useApp();

  const [inputKey, setInputKey] = useState<string>(geminiApiKey);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  useEffect(() => {
    if (isApiSidebarOpen) {
      setInputKey(geminiApiKey);
      setTestResult(null);
    }
  }, [isApiSidebarOpen, geminiApiKey]);

  if (!isApiSidebarOpen) return null;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputKey(text.trim());
        setTestResult(null);
        showToast('Clipboard එකෙන් API Key එක paste කරන ලදී', 'info');
      }
    } catch {
      showToast('Clipboard කියවීමට නොහැකි විය. කරුණාකර Ctrl+V භාවිතා කරන්න.', 'warning');
    }
  };

  const handleSave = () => {
    saveGeminiApiKey(inputKey);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    const keyToUse = inputKey.trim() || geminiApiKey.trim();
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await apiService.testConnection(keyToUse);
      setTestResult(result);
      if (result.ok) {
        showToast(
          `සම්බන්ධතාව සාර්ථකයි! (${result.modelUsed || 'Gemini Flash'} • ${result.latencyMs}ms)`,
          'success'
        );
      } else {
        showToast(result.error || 'සම්බන්ධතාව පරීක්ෂා කිරීම අසාර්ථක විය', 'error');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleRestoreDefault = () => {
    restoreDefaultGeminiApiKey();
    setInputKey('');
    setTestResult(null);
  };

  const handleRemoveKey = () => {
    removeGeminiApiKey();
    setInputKey('');
    setTestResult(null);
  };

  const isConfigured = Boolean(inputKey.trim() || geminiApiKey.trim() || hasGeminiKey);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsApiSidebarOpen(false)}
      />

      {/* Right Slide-Over Drawer */}
      <aside className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Top Dark Gradient Header */}
        <div className="bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] p-6 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/20 shrink-0">
                <KeyRound className="w-5 h-5 text-slate-950 stroke-[2.3]" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight leading-snug">
                  Gemini API Settings
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Google Gemini API යතුර සහ සම්බන්ධතාව
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsApiSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Pill */}
          <div className="mt-5">
            <div
              className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-bold ${
                isConfigured
                  ? 'bg-slate-800/90 border-slate-700/80 text-emerald-400'
                  : 'bg-slate-800/90 border-slate-700/80 text-amber-300'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConfigured
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                }`}
              />
              <span>
                {isConfigured ? 'API Key Configured & Ready' : 'Hybrid Mode Ready (Add Key)'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 bg-white text-slate-800 p-6 overflow-y-auto space-y-5">
          {/* Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                GEMINI API KEY
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="AIzaSy..."
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 pr-20 text-sm text-slate-800 font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {inputKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputKey('');
                      setTestResult(null);
                    }}
                    title="Clear"
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowKey((prev) => !prev)}
                  title={showKey ? 'Hide API Key' : 'Show API Key'}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
              මෙම key එක browser එකේ local storage තුළ සුරැකෙන බැවින් ඔබට ඕනෑම වේලාවක නැවත භාවිතා කළ හැක.
            </p>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0b1120] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.99]"
            >
              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
              <span>Save API Key (සුරකින්න)</span>
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-indigo-500" />
              )}
              <span>
                {isTesting
                  ? 'Testing Connection (පරීක්ෂා කරමින්...)'
                  : 'Test Connection & Latency (පරීක්ෂා කරන්න)'}
              </span>
            </button>
          </div>

          {/* Test Connection Result Banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-bold">
                  {testResult.ok
                    ? `Connection Successful • ${testResult.latencyMs}ms`
                    : 'Connection Failed'}
                </div>
                <div className="text-[11px] opacity-90">
                  {testResult.ok
                    ? `Active Model: ${testResult.modelUsed || 'gemini-2.5-flash'}`
                    : testResult.error}
                </div>
              </div>
            </div>
          )}

          {/* Restore / Remove Row */}
          <div className="flex items-center justify-between pt-1 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handleRestoreDefault}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-4 transition-colors cursor-pointer"
            >
              Restore Default Working Key
            </button>
            <button
              type="button"
              onClick={handleRemoveKey}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
            >
              Remove Key
            </button>
          </div>

          {/* Instructions Card */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Info className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800">
                නොමිලේ Gemini API Key එකක් ගන්නේ කෙසේද?
              </h3>
            </div>

            <ol className="space-y-2 text-xs text-slate-600 pl-1">
              <li className="flex items-center flex-wrap gap-1">
                <span>1.</span>
                <strong className="text-slate-800">Google AI Studio</strong>
                <span>වෙත යන්න:</span>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline font-semibold inline-flex items-center gap-1"
                >
                  <span>aistudio.google.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                2. <strong className="text-slate-800">"Create API key"</strong> ක්ලික් කර නව යතුරක් ලබා ගන්න.
              </li>
              <li>
                3. එම key එක මෙහි paste කර <strong className="text-slate-800">"Save API Key"</strong> ක්ලික් කරන්න.
              </li>
            </ol>

            <div className="bg-white border border-slate-200/90 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed">
              💡 <strong className="text-slate-800">Model Support:</strong> App එක Gemini 2.5 Flash, 3.5 Flash Lite සහ 3.8 Flash මාදිලි සඳහා ස්වයංක්‍රීයව fallback සහිතව සකස් කර ඇත.
            </div>
          </div>
        </div>

        {/* Footer Close Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={() => setIsApiSidebarOpen(false)}
            className="w-full py-1.5 text-center text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
          >
            Close Settings (වසන්න)
          </button>
        </div>
      </aside>
    </div>
  );
};

