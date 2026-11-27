import { beforeEach, describe, expect, it } from "vitest";
import { parseExpenses, parseAppData, loadExpenses, saveExpenses } from "./storage";
import { createAppStore } from "../store";
import { expenseAdded } from "../store/expensesSlice";
import type { Expense } from "../types";

const validExpense: Expense = {
  id: "e1",
  description: "Test",
  amount: 10000,
  paidBy: "m1",
  date: "2024-01-01",
  category: "Food",
  split: { type: "equal", memberIds: ["m1", "m2"] },
};

describe("parseExpenses", () => {
  it("accepts valid expense array", () => {
    const result = parseExpenses([validExpense]);
    expect(result).toEqual([validExpense]);
  });

  it("rejects non-array", () => {
    expect(parseExpenses("not an array")).toBeNull();
    expect(parseExpenses({})).toBeNull();
    expect(parseExpenses(null)).toBeNull();
  });

  it("rejects array with invalid expense", () => {
    const invalid = { ...validExpense, amount: "not a number" };
    expect(parseExpenses([invalid])).toBeNull();
  });

  it("rejects expense with wrong split shape", () => {
    const invalid = { ...validExpense, split: { type: "equal", memberIds: "not an array" } };
    expect(parseExpenses([invalid])).toBeNull();
  });

  it("accepts all split types", () => {
    const expenses = [
      { ...validExpense, split: { type: "equal", memberIds: ["m1"] } },
      { ...validExpense, split: { type: "exact", shares: { m1: 5000 } } },
      { ...validExpense, split: { type: "percent", shares: { m1: 100 } } },
    ];
    const result = parseExpenses(expenses);
    expect(result).toEqual(expenses);
  });
});

describe("parseAppData", () => {
  it("accepts valid app data", () => {
    const data = {
      members: [{ id: "m1", name: "Alice" }],
      expenses: [validExpense],
    };
    const result = parseAppData(data);
    expect(result).toEqual(data);
  });

  it("rejects non-object", () => {
    expect(parseAppData(null)).toBeNull();
    expect(parseAppData("string")).toBeNull();
    expect(parseAppData([])).toBeNull();
  });

  it("rejects invalid members", () => {
    const data = {
      members: [{ id: "m1" }], // missing name
      expenses: [],
    };
    expect(parseAppData(data)).toBeNull();
  });

  it("rejects invalid expenses", () => {
    const data = {
      members: [{ id: "m1", name: "Alice" }],
      expenses: [{ ...validExpense, amount: "not a number" }],
    };
    expect(parseAppData(data)).toBeNull();
  });
});

describe("loadExpenses and saveExpenses", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads expenses", () => {
    const expenses = [validExpense];
    saveExpenses(expenses);

    const loaded = loadExpenses();
    expect(loaded.expenses).toEqual(expenses);
  });

  it("persists app-store expense changes to localStorage", () => {
    const store = createAppStore();
    store.dispatch(expenseAdded(validExpense));

    expect(loadExpenses().expenses).toEqual([validExpense]);
  });

  it("falls back to sample data when localStorage is empty", () => {
    const loaded = loadExpenses();
    expect(Array.isArray(loaded.members)).toBe(true);
    expect(Array.isArray(loaded.expenses)).toBe(true);
  });

  it("falls back to sample data when localStorage has corrupt JSON", () => {
    localStorage.setItem("trip-splitter-expenses", "not valid json");
    const loaded = loadExpenses();
    expect(Array.isArray(loaded.members)).toBe(true);
    expect(Array.isArray(loaded.expenses)).toBe(true);
  });

  it("falls back to sample data when localStorage has wrong shape", () => {
    localStorage.setItem("trip-splitter-expenses", JSON.stringify({ wrong: "shape" }));
    const loaded = loadExpenses();
    expect(Array.isArray(loaded.members)).toBe(true);
    expect(Array.isArray(loaded.expenses)).toBe(true);
  });
});
