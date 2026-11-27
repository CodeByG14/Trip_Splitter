import { configureStore } from "@reduxjs/toolkit";
import expensesReducer, { dataLoaded } from "./expensesSlice";

/**
 * Store factory for creating a Redux store with optional preloaded state.
 * Tests can create their own stores with custom data.
 */
export function makeStore(preloadedState?: Partial<RootState>) {
  const store = configureStore({
    reducer: {
      expenses: expensesReducer,
    },
  });

  if (preloadedState?.expenses) {
    store.dispatch(dataLoaded(preloadedState.expenses));
  }
  
  return store;
}

// Infer the RootState and AppDispatch types from the store itself
// Used only for type inference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _tempStoreForTypes = configureStore({
  reducer: {
    expenses: expensesReducer,
  },
});

export type RootState = ReturnType<typeof _tempStoreForTypes.getState>;
export type AppDispatch = typeof _tempStoreForTypes.dispatch;
