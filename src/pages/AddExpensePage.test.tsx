import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import App from "../App";
import { renderWithProviders } from "../test/renderWithProviders";
import { testMembers } from "../test/fixtures";

describe("AddExpensePage", () => {
  it("shows field errors on submit and does not save invalid data", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<App />, {
      initialEntries: ["/expenses/new"],
      preloadedState: { expenses: { members: testMembers, expenses: [] } },
    });

    for (const checkbox of screen.getAllByRole("checkbox")) {
      await user.click(checkbox);
    }
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Description is required")).toBeTruthy();
    expect(screen.getByText("Amount is required")).toBeTruthy();
    expect(screen.getByText("Select who paid")).toBeTruthy();
    expect(screen.getByText("Select a category")).toBeTruthy();
    expect(screen.getByText("Select at least one member")).toBeTruthy();
    expect(store.getState().expenses.expenses).toHaveLength(0);
    expect(screen.getByLabelText("Description").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("group", { name: "Split" }).getAttribute("aria-describedby"))
      .toBe("split-error");
  });

  it("shows the negative amount message and keeps the expense unsaved", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<App />, {
      initialEntries: ["/expenses/new"],
      preloadedState: { expenses: { members: testMembers, expenses: [] } },
    });

    await user.type(screen.getByLabelText("Amount (₹)"), "-5");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Amount must be more than ₹0")).toBeTruthy();
    expect(store.getState().expenses.expenses).toHaveLength(0);
  });

  it("saves a valid expense and navigates to the expense list with a message", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<App />, {
      initialEntries: ["/expenses/new"],
      preloadedState: { expenses: { members: testMembers, expenses: [] } },
    });

    await user.type(screen.getByLabelText("Description"), "Goa dinner");
    await user.type(screen.getByLabelText("Amount (₹)"), "1250.50");
    await user.selectOptions(screen.getByLabelText("Paid by"), "m1");
    await user.selectOptions(screen.getByLabelText("Category"), "Food");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findByRole("status")).textContent).toContain("Expense added");
    expect(screen.getByText("Goa dinner")).toBeTruthy();
    expect(store.getState().expenses.expenses).toHaveLength(1);
    expect(store.getState().expenses.expenses[0].amount).toBe(125050);
  });

  it("preserves exact split inputs while switching split types", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<App />, {
      initialEntries: ["/expenses/new"],
      preloadedState: { expenses: { members: testMembers, expenses: [] } },
    });

    await user.type(screen.getByLabelText("Description"), "Shared taxi");
    await user.type(screen.getByLabelText("Amount (₹)"), "100");
    await user.selectOptions(screen.getByLabelText("Paid by"), "m1");
    await user.selectOptions(screen.getByLabelText("Category"), "Travel");
    await user.click(screen.getByLabelText("Exact amounts"));
    await user.type(screen.getByLabelText("Alice amount (₹)"), "60");
    await user.type(screen.getByLabelText("Bob amount (₹)"), "40");
    await user.click(screen.getByLabelText("Percentages"));
    await user.click(screen.getByLabelText("Exact amounts"));

    expect(screen.getByLabelText("Alice amount (₹)")).toHaveValue("60");
    expect(screen.getByLabelText("Bob amount (₹)")).toHaveValue("40");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findByRole("status")).textContent).toContain("Expense added");
    const expense = store.getState().expenses.expenses[0];
    expect(expense.split).toEqual({ type: "exact", shares: { m1: 6000, m2: 4000 } });
  });

  it("lets Cancel return to Expenses without saving", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<App />, {
      initialEntries: ["/expenses/new"],
      preloadedState: { expenses: { members: testMembers, expenses: [] } },
    });

    await user.type(screen.getByLabelText("Description"), "Not saved");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(await screen.findByRole("heading", { name: "Expenses" })).toBeTruthy();
    expect(store.getState().expenses.expenses).toHaveLength(0);
  });
});
