import { create } from 'zustand';
import { Assumptions, EngineResults, ScenarioId } from '../engine/types';
import { DEFAULT_ASSUMPTIONS } from '../engine/defaults';
import { calcAll } from '../engine/calcAll';

export interface SavedScenario {
  id: string;
  name: string;
  date: string;
  assumptions: Assumptions;
  moic: number;
  irr: number;
  minDscr: number;
}

export type TabId =
  | 'command'
  | 'deal_structure'
  | 'returns'
  | 'debt_capacity'
  | 'qoe'
  | 'cash13w'
  | 'wip'
  | 'price_lab'
  | 'risk'
  | 'tax'
  | 'three_stmt'  | 'financial_statements'
  | 'plan_vs_actual'
  | 'data_room'
  | 'diagnostics';

interface DealState {
  assumptions: Assumptions;
  results: EngineResults;
  activeTab: TabId;
  theme: 'dark' | 'light';
  isRailCollapsed: boolean;
  diffDrawerOpen: boolean;
  goalSeekModalOpen: boolean;
  scenarioCompareOpen: boolean;
  tourStep: number | null; // 0..5, or null when closed
  searchQuery: string;

  // History for undo/redo
  history: Assumptions[];
  future: Assumptions[];

  // Saved scenarios
  savedScenarios: SavedScenario[];
  pinnedScenarioIds: string[];

  // Actions
  setAssumption: <K extends keyof Assumptions>(key: K, value: Assumptions[K]) => void;
  updateAssumption: <K extends keyof Assumptions>(key: K, value: Assumptions[K]) => void;
  setResults: (results: EngineResults) => void;
  recompute: () => void;
  setScenario: (scenario: ScenarioId) => void;
  batchUpdateAssumptions: (partial: Partial<Assumptions>) => void;
  resetAll: () => void;
  resetField: (key: keyof Assumptions) => void;
  applyPreset: (presetName: string) => void;

  undo: () => void;
  redo: () => void;

  setActiveTab: (tab: TabId) => void;
  toggleTheme: () => void;
  toggleRail: () => void;
  setDiffDrawerOpen: (open: boolean) => void;
  setGoalSeekModalOpen: (open: boolean) => void;
  setScenarioCompareOpen: (open: boolean) => void;
  setTourStep: (step: number | null) => void;
  setSearchQuery: (query: string) => void;

  saveCurrentScenario: (name: string) => void;
  loadScenario: (scenario: SavedScenario) => void;
  deleteSavedScenario: (id: string) => void;
  togglePinScenario: (id: string) => void;

  loadFromHash: (hash: string) => boolean;
  getShareableUrl: () => string;
}

const STORAGE_KEY = 'project_cliff_deal_lab_assumptions_v1';
const SAVED_SCENARIOS_KEY = 'project_cliff_saved_scenarios_v1';

function loadInitialAssumptions(): Assumptions {
  if (typeof window !== 'undefined') {
    // 1. Try URL hash first
    const hash = window.location.hash.slice(1);
    if (hash && hash.startsWith('model=')) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(hash.slice(6))));
        return { ...DEFAULT_ASSUMPTIONS, ...decoded };
      } catch {}
    }

    // 2. Try localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_ASSUMPTIONS, ...JSON.parse(stored) };
      }
    } catch {}
  }
  return DEFAULT_ASSUMPTIONS;
}

function loadInitialSavedScenarios(): SavedScenario[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(SAVED_SCENARIOS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
  }
  return [];
}

const initialAssumptions = loadInitialAssumptions();
const initialResults = calcAll(initialAssumptions);

export const useDealStore = create<DealState>((set, get) => ({
  assumptions: initialAssumptions,
  results: initialResults,
  activeTab: 'command',
  theme: 'dark',
  isRailCollapsed: false,
  diffDrawerOpen: false,
  goalSeekModalOpen: false,
  scenarioCompareOpen: false,
  tourStep: null,
  searchQuery: '',

  history: [],
  future: [],

  savedScenarios: loadInitialSavedScenarios(),
  pinnedScenarioIds: [],

  setAssumption: (key, value) => {
    const current = get().assumptions;
    if (current[key] === value) return;

    const next = { ...current, [key]: value };
    const nextResults = calcAll(next);

    set({
      assumptions: next,
      results: nextResults,
      history: [current, ...get().history.slice(0, 49)],
      future: [],
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  },

  updateAssumption: (key, value) => {
    get().setAssumption(key, value);
  },

  setResults: (results) => {
    set({ results });
  },

  recompute: () => {
    const nextResults = calcAll(get().assumptions);
    set({ results: nextResults });
  },

  setScenario: (scenario: ScenarioId) => {
    get().setAssumption('activeScenario', scenario);
  },

  batchUpdateAssumptions: (partial: Partial<Assumptions>) => {
    const current = get().assumptions;
    const next = { ...current, ...partial };
    const nextResults = calcAll(next);

    set({
      assumptions: next,
      results: nextResults,
      history: [current, ...get().history.slice(0, 49)],
      future: [],
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  },

  resetAll: () => {
    const current = get().assumptions;
    const next = { ...DEFAULT_ASSUMPTIONS };
    const nextResults = calcAll(next);

    set({
      assumptions: next,
      results: nextResults,
      history: [current, ...get().history.slice(0, 49)],
      future: [],
    });

    try {
      localStorage.removeItem(STORAGE_KEY);
      window.location.hash = '';
    } catch {}
  },

  resetField: (key) => {
    const defaultVal = DEFAULT_ASSUMPTIONS[key];
    get().setAssumption(key, defaultVal);
  },

  applyPreset: (presetName: string) => {
    const current = get().assumptions;
    let next: Assumptions = { ...DEFAULT_ASSUMPTIONS };

    switch (presetName) {
      case 'As signed LOIs':
        next = { ...DEFAULT_ASSUMPTIONS, activeScenario: 'base' };
        break;

      case 'Lender-friendly (loan sized to 1.25x DSCR)': {
        // Compute base max loan at 1.25x DSCR = $1,773,876
        next = {
          ...DEFAULT_ASSUMPTIONS,
          activeScenario: 'base',
          seniorLoanAmount: 1773876,
        };
        break;
      }

      case 'Reprice to 4.5x run-rate': {
        // Salisbury 4.5x = $2,055,476; Rocmont 4.5x = $4,846,021
        next = {
          ...DEFAULT_ASSUMPTIONS,
          activeScenario: 'base',
          salisburyLoi: {
            ...DEFAULT_ASSUMPTIONS.salisburyLoi,
            ev: 2055476,
            cashAtClosing: 616643,
            sellerNote: 822191,
          },
          rocmontLoi: {
            ...DEFAULT_ASSUMPTIONS.rocmontLoi,
            ev: 4846021,
            cashAtClosing: 3638834,
            sellerNote: 480284,
          },
        };
        break;
      }

      case 'Management case':
        next = { ...DEFAULT_ASSUMPTIONS, activeScenario: 'mgmt' };
        break;

      case 'Stress':
        next = {
          ...DEFAULT_ASSUMPTIONS,
          activeScenario: 'downside',
          downsideRevenueHaircut: 0.15,
          downsideMarginCutPts: 0.03,
          exitMultiple: 4.5,
        };
        break;

      default:
        return;
    }

    const nextResults = calcAll(next);
    set({
      assumptions: next,
      results: nextResults,
      history: [current, ...get().history.slice(0, 49)],
      future: [],
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  },

  undo: () => {
    const { history, assumptions, future } = get();
    if (history.length === 0) return;

    const previous = history[0];
    const newHistory = history.slice(1);
    const prevResults = calcAll(previous);

    set({
      assumptions: previous,
      results: prevResults,
      history: newHistory,
      future: [assumptions, ...future.slice(0, 49)],
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
    } catch {}
  },

  redo: () => {
    const { future, assumptions, history } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const nextResults = calcAll(next);

    set({
      assumptions: next,
      results: nextResults,
      history: [assumptions, ...history.slice(0, 49)],
      future: newFuture,
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  toggleRail: () => set((state) => ({ isRailCollapsed: !state.isRailCollapsed })),
  setDiffDrawerOpen: (diffDrawerOpen) => set({ diffDrawerOpen }),
  setGoalSeekModalOpen: (goalSeekModalOpen) => set({ goalSeekModalOpen }),
  setScenarioCompareOpen: (scenarioCompareOpen) => set({ scenarioCompareOpen }),
  setTourStep: (tourStep) => set({ tourStep }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  saveCurrentScenario: (name: string) => {
    const { assumptions, results, savedScenarios } = get();
    const newScenario: SavedScenario = {
      id: `sc_${Date.now()}`,
      name,
      date: new Date().toLocaleDateString(),
      assumptions: { ...assumptions },
      moic: results.activeEquityInjection.sponsorMoicV3,
      irr: results.activeEquityInjection.sponsorIrrV3,
      minDscr: results.activeModel.minDscr,
    };
    const updated = [newScenario, ...savedScenarios];
    set({ savedScenarios: updated });
    try {
      localStorage.setItem(SAVED_SCENARIOS_KEY, JSON.stringify(updated));
    } catch {}
  },

  loadScenario: (scenario: SavedScenario) => {
    const current = get().assumptions;
    const next = { ...scenario.assumptions };
    const nextResults = calcAll(next);
    set({
      assumptions: next,
      results: nextResults,
      history: [current, ...get().history.slice(0, 49)],
      future: [],
    });
  },

  deleteSavedScenario: (id: string) => {
    const updated = get().savedScenarios.filter((s) => s.id !== id);
    set({
      savedScenarios: updated,
      pinnedScenarioIds: get().pinnedScenarioIds.filter((p) => p !== id),
    });
    try {
      localStorage.setItem(SAVED_SCENARIOS_KEY, JSON.stringify(updated));
    } catch {}
  },

  togglePinScenario: (id: string) => {
    const current = get().pinnedScenarioIds;
    if (current.includes(id)) {
      set({ pinnedScenarioIds: current.filter((p) => p !== id) });
    } else {
      if (current.length >= 3) {
        // limit 3 pinned
        set({ pinnedScenarioIds: [...current.slice(1), id] });
      } else {
        set({ pinnedScenarioIds: [...current, id] });
      }
    }
  },

  loadFromHash: (hash: string) => {
    if (!hash || !hash.startsWith('model=')) return false;
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(hash.slice(6))));
      const next = { ...DEFAULT_ASSUMPTIONS, ...decoded };
      const nextResults = calcAll(next);
      set({ assumptions: next, results: nextResults });
      return true;
    } catch {
      return false;
    }
  },

  getShareableUrl: () => {
    const { assumptions } = get();
    const encoded = btoa(encodeURIComponent(JSON.stringify(assumptions)));
    const url = new URL(window.location.href);
    url.hash = `model=${encoded}`;
    return url.toString();
  },
}));
