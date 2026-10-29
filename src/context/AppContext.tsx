import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  StockEvent,
  ResolvedEvent,
  StockNiche,
  StockPrompt,
  ContributorProject,
  TargetCountry,
  AssetType,
  EventCategory,
} from '../types';
import { STOCK_EVENTS_DATABASE } from '../data/eventsDatabase';
import {
  formatDateString,
  getDaysRemaining,
  getPreparationDate,
  getPreparationStatus,
  getDaysInMonth,
  getWeekdayName,
} from '../utils/dateCalculations';
import { calculateEventOpportunityScore } from '../utils/opportunityScoring';
import {
  apiService,
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
} from '../services/apiService';

export type NavigationTab =
  | 'dashboard'
  | 'calendar'
  | 'events'
  | 'niches'
  | 'prompts'
  | 'planner'
  | 'countries'
  | 'keywords'
  | 'projects'
  | 'reports'
  | 'settings';

export type CalendarViewMode = 'month' | 'week' | 'day' | 'year';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  calendarView: CalendarViewMode;
  setCalendarView: (view: CalendarViewMode) => void;
  selectedDateStr: string; // YYYY-MM-DD
  setSelectedDateStr: (date: string) => void;
  currentYear: number;
  currentMonth: number; // 1 - 12
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
  goToToday: () => void;
  nextPeriod: () => void;
  prevPeriod: () => void;

  // Events & Filtering
  allResolvedEvents: ResolvedEvent[];
  filteredEvents: ResolvedEvent[];
  selectedEvent: ResolvedEvent | null;
  setSelectedEvent: (ev: ResolvedEvent | null) => void;
  isEventModalOpen: boolean;
  setIsEventModalOpen: (open: boolean) => void;
  openEventDetail: (ev: ResolvedEvent) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategories: string[];
  toggleCategoryFilter: (cat: string) => void;
  clearCategoryFilters: () => void;
  countryFilter: TargetCountry | 'All';
  setCountryFilter: (c: TargetCountry | 'All') => void;
  assetTypeFilter: AssetType | 'All';
  setAssetTypeFilter: (a: AssetType | 'All') => void;
  leadTimeFilter: string;
  setLeadTimeFilter: (lt: string) => void;
  resetAllFilters: () => void;

  // Projects
  projects: ContributorProject[];
  addProject: (p: Omit<ContributorProject, 'id' | 'createdAt' | 'updatedAt'>) => ContributorProject;
  updateProject: (id: string, updates: Partial<ContributorProject>) => void;
  deleteProject: (id: string) => void;

  // Prompts & Favorites
  favoritePrompts: StockPrompt[];
  toggleFavoritePrompt: (p: StockPrompt) => void;
  isPromptFavorited: (promptId: string) => boolean;

  // Active Niche Discovery Workspace
  currentNiches: StockNiche[];
  setCurrentNiches: React.Dispatch<React.SetStateAction<StockNiche[]>>;
  isDiscoveringNiches: boolean;
  discoverNichesForEvent: (event: ResolvedEvent, customAssetTypes?: AssetType[]) => Promise<void>;

  // System & Toast
  toasts: ToastInfo[];
  showToast: (message: string, type?: ToastInfo['type']) => void;
  hasGeminiKey: boolean;

  // Gemini API Settings Sidebar
  isApiSidebarOpen: boolean;
  setIsApiSidebarOpen: (open: boolean) => void;
  geminiApiKey: string;
  saveGeminiApiKey: (key: string) => void;
  removeGeminiApiKey: () => void;
  restoreDefaultGeminiApiKey: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  PROJECTS: 'stockniche_pro_projects_v1',
  FAVORITES: 'stockniche_pro_favorites_v1',
  SETTINGS: 'stockniche_pro_settings_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const today = useMemo(() => new Date(), []);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('month');

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate())
  );

  const [selectedEvent, setSelectedEvent] = useState<ResolvedEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState<TargetCountry | 'All'>('All');
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType | 'All'>('All');
  const [leadTimeFilter, setLeadTimeFilter] = useState<string>('All');

  // Projects & Favorites state
  const [projects, setProjects] = useState<ContributorProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading projects from localStorage', e);
    }
    // Default initial starter project for stock contributors
    return [
      {
        id: 'proj-sample-1',
        name: 'Christmas Eve & Day Isometric Vector Pack',
        eventName: 'Christmas Eve & Christmas Day',
        eventDate: `${today.getFullYear()}-12-25`,
        targetMarket: 'Global',
        assetCategory: 'Vector',
        plannedQuantity: 12,
        priority: 'High',
        startDate: formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        deadline: `${today.getFullYear()}-11-15`,
        status: 'In Production',
        notes: 'Targeting flat vectors with glossy 3D gradients and isolated objects on transparent layers. Zero raster elements for strict microstock compliance.',
        prompts: [
          'Native editable vector illustration of Christmas ornaments and gold glitter accents, isolated on white background, clean bezier paths.',
        ],
        keywords: ['christmas', 'vector', 'holiday', 'ornament', 'xmas', 'isolated on white', 'celebration', 'winter', 'card template'],
        checklist: [
          { id: 'chk-1', text: 'Research trending Adobe Stock winter color palettes', completed: true },
          { id: 'chk-2', text: 'Generate 12 unique icon concepts without repetition', completed: true },
          { id: 'chk-3', text: 'Vectorize paths in Illustrator, expand all strokes', completed: false },
          { id: 'chk-4', text: 'Check for open paths and ghost raster layers', completed: false },
          { id: 'chk-5', text: 'Save compliant EPS 10 and 5000x5000px preview JPEG', completed: false },
        ],
        opportunityScore: 96,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  const [favoritePrompts, setFavoritePrompts] = useState<StockPrompt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading favorite prompts', e);
    }
    return [];
  });

  // Current Niche Discovery state
  const [currentNiches, setCurrentNiches] = useState<StockNiche[]>([]);
  const [isDiscoveringNiches, setIsDiscoveringNiches] = useState<boolean>(false);

  // Toasts & Gemini API Key state
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => getStoredGeminiApiKey());
  const [serverHasGeminiKey, setServerHasGeminiKey] = useState<boolean>(false);
  const [isApiSidebarOpen, setIsApiSidebarOpen] = useState<boolean>(false);

  const hasGeminiKey = Boolean(geminiApiKey.trim() || serverHasGeminiKey);

  // Check backend Gemini API status on mount
  useEffect(() => {
    apiService.getStatus().then((status) => {
      setServerHasGeminiKey(status.hasGeminiKey);
    });
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects', e);
    }
  }, [projects]);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoritePrompts));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }, [favoritePrompts]);

  const showToast = useCallback((message: string, type: ToastInfo['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const saveGeminiApiKey = useCallback(
    (key: string) => {
      const cleaned = key.trim();
      setStoredGeminiApiKey(cleaned);
      setGeminiApiKey(cleaned);
      if (cleaned) {
        showToast('Gemini API Key සාර්ථකව සුරකින ලදී! (Saved to browser)', 'success');
      } else {
        showToast('Gemini API Key ඉවත් කරන ලදී', 'info');
      }
    },
    [showToast]
  );

  const removeGeminiApiKey = useCallback(() => {
    setStoredGeminiApiKey('');
    setGeminiApiKey('');
    showToast('Gemini API Key ඉවත් කරන ලදී (Removed)', 'info');
  }, [showToast]);

  const restoreDefaultGeminiApiKey = useCallback(() => {
    setStoredGeminiApiKey('');
    setGeminiApiKey('');
    apiService.getStatus().then((status) => {
      setServerHasGeminiKey(status.hasGeminiKey);
    });
    showToast('Default Working Engine වෙත නැවත සකසන ලදී!', 'success');
  }, [showToast]);

  // Compute resolved events dynamically for currentYear
  const allResolvedEvents = useMemo<ResolvedEvent[]>(() => {
    return STOCK_EVENTS_DATABASE.map((ev) => {
      let resolvedMonth = ev.month;
      let resolvedDay = ev.day || 1;

      if (ev.calculateDate) {
        const computed = ev.calculateDate(currentYear);
        resolvedMonth = computed.month;
        resolvedDay = computed.day;
      }

      const dateStr = formatDateString(currentYear, resolvedMonth, resolvedDay);
      const [y, m, d] = dateStr.split('-').map(Number);
      const evDate = new Date(y, m - 1, d);
      const dayOfWeek = getWeekdayName(evDate);
      const daysRemaining = getDaysRemaining(dateStr, today);
      const prepWeeks = ev.typicalPreparationWeeks || 8;
      const recommendedPreparationDate = getPreparationDate(dateStr, prepWeeks);
      const preparationStatus = getPreparationStatus(daysRemaining, prepWeeks);

      const scoreResult = calculateEventOpportunityScore(ev, daysRemaining);

      return {
        ...ev,
        resolvedDate: dateStr,
        resolvedYear: currentYear,
        resolvedMonth,
        resolvedDay,
        dayOfWeek,
        daysRemaining,
        recommendedPreparationDate,
        preparationStatus,
        opportunityScore: scoreResult.score,
      };
    }).sort((a, b) => a.resolvedDate.localeCompare(b.resolvedDate));
  }, [currentYear, today]);

  // Filter events based on active search & filter states
  const filteredEvents = useMemo(() => {
    return allResolvedEvents.filter((ev) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = ev.name.toLowerCase().includes(q);
        const matchesDesc = ev.description.toLowerCase().includes(q);
        const matchesTag = ev.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCat = ev.category.toLowerCase().includes(q);
        const matchesCountry = ev.countries.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTag && !matchesCat && !matchesCountry) {
          return false;
        }
      }

      // Categories filter (multi-select)
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(ev.category)) {
          return false;
        }
      }

      // Country filter
      if (countryFilter !== 'All') {
        const hasCountry = ev.countries.includes(countryFilter) || ev.countries.includes('Global');
        if (!hasCountry) return false;
      }

      // Asset Type filter
      if (assetTypeFilter !== 'All') {
        if (!ev.bestAssetTypes.includes(assetTypeFilter)) return false;
      }

      // Lead time filter
      if (leadTimeFilter === 'Urgent') {
        if (ev.daysRemaining < 0 || ev.daysRemaining > 30) return false;
      } else if (leadTimeFilter === 'Next90Days') {
        if (ev.daysRemaining < 0 || ev.daysRemaining > 90) return false;
      } else if (leadTimeFilter === 'IdealWindow') {
        if (ev.preparationStatus !== 'Ideal Production Window') return false;
      }

      return true;
    });
  }, [allResolvedEvents, searchQuery, selectedCategories, countryFilter, assetTypeFilter, leadTimeFilter]);

  // Calendar navigation methods
  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDateStr(formatDateString(now.getFullYear(), now.getMonth() + 1, now.getDate()));
  }, []);

  const nextPeriod = useCallback(() => {
    if (calendarView === 'year') {
      setCurrentYear((y) => y + 1);
    } else if (calendarView === 'month' || calendarView === 'week' || calendarView === 'day') {
      setCurrentMonth((m) => {
        if (m === 12) {
          setCurrentYear((y) => y + 1);
          return 1;
        }
        return m + 1;
      });
    }
  }, [calendarView]);

  const prevPeriod = useCallback(() => {
    if (calendarView === 'year') {
      setCurrentYear((y) => y - 1);
    } else if (calendarView === 'month' || calendarView === 'week' || calendarView === 'day') {
      setCurrentMonth((m) => {
        if (m === 1) {
          setCurrentYear((y) => y - 1);
          return 12;
        }
        return m - 1;
      });
    }
  }, [calendarView]);

  const setYear = useCallback((year: number) => {
    setCurrentYear(year);
  }, []);

  const setMonth = useCallback((month: number) => {
    setCurrentMonth(month);
  }, []);

  const toggleCategoryFilter = useCallback((cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const clearCategoryFilters = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const resetAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategories([]);
    setCountryFilter('All');
    setAssetTypeFilter('All');
    setLeadTimeFilter('All');
    showToast('Filters cleared', 'info');
  }, [showToast]);

  const openEventDetail = useCallback((ev: ResolvedEvent) => {
    setSelectedEvent(ev);
    setSelectedDateStr(ev.resolvedDate);
    setIsEventModalOpen(true);
  }, []);

  // Project management
  const addProject = useCallback(
    (newProjectData: Omit<ContributorProject, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newProj: ContributorProject = {
        ...newProjectData,
        id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects((prev) => [newProj, ...prev]);
      showToast(`Added project "${newProj.name}" to planner!`, 'success');
      return newProj;
    },
    [showToast]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<ContributorProject>) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
      );
      showToast('Project updated successfully', 'success');
    },
    [showToast]
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast('Project deleted', 'info');
    },
    [showToast]
  );

  // Favorites
  const toggleFavoritePrompt = useCallback(
    (prompt: StockPrompt) => {
      setFavoritePrompts((prev) => {
        const exists = prev.some((p) => p.id === prompt.id || p.promptText === prompt.promptText);
        if (exists) {
          showToast('Removed from favorites', 'info');
          return prev.filter((p) => p.id !== prompt.id && p.promptText !== prompt.promptText);
        } else {
          showToast('Saved prompt to favorites!', 'success');
          return [{ ...prompt, isFavorite: true }, ...prev];
        }
      });
    },
    [showToast]
  );

  const isPromptFavorited = useCallback(
    (promptId: string) => {
      return favoritePrompts.some((p) => p.id === promptId);
    },
    [favoritePrompts]
  );

  // Discover Niches action
  const discoverNichesForEvent = useCallback(
    async (event: ResolvedEvent, customAssetTypes?: AssetType[]) => {
      setIsDiscoveringNiches(true);
      try {
        const assets = customAssetTypes || event.bestAssetTypes;
        const results = await apiService.discoverNiches({
          eventName: event.name,
          date: event.resolvedDate,
          category: event.category,
          country: event.countries.includes('Global') ? 'Global' : event.countries[0],
          assetTypes: assets,
        });
        setCurrentNiches(results);
        setActiveTab('niches');
        showToast(`Discovered ${results.length} commercial niches for ${event.name}!`, 'success');
      } catch (err) {
        showToast('Failed to discover niches', 'error');
      } finally {
        setIsDiscoveringNiches(false);
      }
    },
    [showToast]
  );

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        calendarView,
        setCalendarView,
        selectedDateStr,
        setSelectedDateStr,
        currentYear,
        currentMonth,
        setYear,
        setMonth,
        goToToday,
        nextPeriod,
        prevPeriod,

        allResolvedEvents,
        filteredEvents,
        selectedEvent,
        setSelectedEvent,
        isEventModalOpen,
        setIsEventModalOpen,
        openEventDetail,

        searchQuery,
        setSearchQuery,
        selectedCategories,
        toggleCategoryFilter,
        clearCategoryFilters,
        countryFilter,
        setCountryFilter,
        assetTypeFilter,
        setAssetTypeFilter,
        leadTimeFilter,
        setLeadTimeFilter,
        resetAllFilters,

        projects,
        addProject,
        updateProject,
        deleteProject,

        favoritePrompts,
        toggleFavoritePrompt,
        isPromptFavorited,

        currentNiches,
        setCurrentNiches,
        isDiscoveringNiches,
        discoverNichesForEvent,

        toasts,
        showToast,
        hasGeminiKey,

        isApiSidebarOpen,
        setIsApiSidebarOpen,
        geminiApiKey,
        saveGeminiApiKey,
        removeGeminiApiKey,
        restoreDefaultGeminiApiKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
