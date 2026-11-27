import { makeStore } from "./store";
import { loadExpenses, saveExpenses } from "../logic/storage";

/**
 * Create the app store and set up persistence.
 * Initial data is loaded from localStorage or sample data.
 * Changes to expenses are automatically saved to localStorage.
 */
export function createAppStore() {
  const initialData = loadExpenses();
  const store = makeStore({
    expenses: initialData,
  });

  // Subscribe to store changes and save expenses to localStorage
  store.subscribe(() => {
    const state = store.getState();
    saveExpenses(state.expenses.expenses);
  });

  return store;
}

export const store = createAppStore();
export type { RootState, AppDispatch } from "./store";
