import { create } from 'zustand';
import { TestResult, CORE_TESTS } from '@/types';
type DashboardState = {
  protocol: 'https://' | 'http://';
  url: string;
  selectedCoreTests: Set<string>;
  isLoading: boolean;
  results: TestResult[];
  error: string | null;
};
type DashboardActions = {
  setProtocol: (protocol: 'https://' | 'http://') => void;
  setUrl: (url: string) => void;
  toggleCoreTest: (id: string) => void;
  selectAllCoreTests: () => void;
  deselectAllCoreTests: () => void;
  startTests: (initialPendingResults: TestResult[]) => void;
  setResults: (results: TestResult[]) => void;
  updateResult: (result: TestResult) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
  reset: () => void;
};
export const useDashboardStore = create<DashboardState & DashboardActions>((set, get) => ({
  protocol: 'https://',
  url: '',
  selectedCoreTests: new Set(),
  isLoading: false,
  results: [],
  error: null,
  setProtocol: (protocol) => set({ protocol }),
  setUrl: (url) => set({ url }),
  toggleCoreTest: (id) => set((state) => {
    const newSet = new Set(state.selectedCoreTests);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    return { selectedCoreTests: newSet };
  }),
  selectAllCoreTests: () => set({ selectedCoreTests: new Set(CORE_TESTS.map(test => test.id)) }),
  deselectAllCoreTests: () => set({ selectedCoreTests: new Set() }),
  startTests: (initialPendingResults) => set({ isLoading: true, results: initialPendingResults, error: null }),
  setResults: (results) => set({ results, isLoading: false }),
  updateResult: (result) => set((state) => ({
    results: state.results.map((r) => (r.id === result.id ? result : r)),
  })),
  setError: (error) => set({ error, isLoading: false }),
  clearResults: () => set({ results: [], error: null }),
  reset: () => set({
    protocol: 'https://',
    url: '',
    selectedCoreTests: new Set(),
    isLoading: false,
    results: [],
    error: null,
  }),
}));