import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { makeStore } from "../store/store";
import type { RootState } from "../store/store";
import type { ReactElement } from "react";

/**
 * Test utility to render components with Redux Provider and MemoryRouter.
 * Tests can pass preloadedState to set up the store with custom data.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    initialEntries = ["/"],
  }: {
    preloadedState?: Partial<RootState>;
    initialEntries?: string[];
  } = {}
) {
  const store = makeStore(preloadedState);

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </Provider>
    ),
    store,
  };
}
