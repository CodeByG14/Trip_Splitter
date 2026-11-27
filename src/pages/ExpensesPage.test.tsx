import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import { ExpensesPage } from "./ExpensesPage";
import { renderWithProviders } from "../test/renderWithProviders";
import { testExpenses, testMembers } from "../test/fixtures";

describe("ExpensesPage", () => {
  it("filters expenses and shows the filtered total", () => {
    renderWithProviders(<ExpensesPage />, {
      preloadedState: {
        expenses: { members: testMembers, expenses: testExpenses },
      },
    });

    fireEvent.change(screen.getByLabelText("Filter by category"), {
      target: { value: "Food" },
    });

    expect(screen.getByText("Dinner at restaurant")).toBeTruthy();
    expect(screen.queryByText("Taxi to hotel")).toBeNull();
    expect(screen.getByText(/Total shown:/).textContent).toContain("₹100.00");
  });

  it("sorts table rows newest first and keeps balances based on all expenses", () => {
    renderWithProviders(<ExpensesPage />, {
      preloadedState: {
        expenses: { members: testMembers, expenses: testExpenses },
      },
    });

    const tableRows = within(screen.getByRole("table")).getAllByRole("row");
    expect(tableRows[1].textContent).toContain("Gift for host");
    expect(tableRows[2].textContent).toContain("Hotel booking");
    expect(tableRows[3].textContent).toContain("Taxi to hotel");

    fireEvent.change(screen.getByLabelText("Filter by category"), {
      target: { value: "Food" },
    });
    expect(screen.getByText("Alice owes ₹40.84")).toBeTruthy();
  });

  it("deletes an expense only after confirmation", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { store } = renderWithProviders(<ExpensesPage />, {
      preloadedState: {
        expenses: { members: testMembers, expenses: testExpenses },
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete Hotel booking" }));
    expect(confirm).toHaveBeenCalled();
    expect(store.getState().expenses.expenses).toHaveLength(testExpenses.length);

    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Delete Hotel booking" }));
    expect(store.getState().expenses.expenses).toHaveLength(testExpenses.length - 1);
    expect(screen.queryByText("Hotel booking")).toBeNull();
    expect(screen.getByText("Alice gets back ₹34.16")).toBeTruthy();
    confirm.mockRestore();
  });

  it("shows distinct empty states for no expenses and an empty category", () => {
    renderWithProviders(<ExpensesPage />, {
      preloadedState: { expenses: { members: testMembers, expenses: [] } },
    });

    expect(screen.getByText("No expenses yet.")).toBeTruthy();
    expect(screen.getByText("Total shown: ₹0.00")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Add your first expense" }).getAttribute("href")
    ).toBe("/expenses/new");
  });

  it("shows a category-specific empty state when the filter has no matches", () => {
    renderWithProviders(<ExpensesPage />, {
      preloadedState: {
        expenses: { members: testMembers, expenses: testExpenses },
      },
    });

    fireEvent.change(screen.getByLabelText("Filter by category"), {
      target: { value: "Activities" },
    });

    expect(screen.getByText("No expenses in the Activities category.")).toBeTruthy();
    expect(screen.getByText("Total shown: ₹0.00")).toBeTruthy();
  });
});
