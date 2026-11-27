import type { Category, Expense, Member, Split } from "../types";
import { CATEGORIES } from "../types";
import sampleData from "../data/sample-data.json";

const STORAGE_KEY = "trip-splitter-expenses";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORIES.some((category) => category === value);
}

function isSplit(value: unknown): value is Split {
  if (!isRecord(value)) {
    return false;
  }

  if (value.type === "equal") {
    return Array.isArray(value.memberIds) &&
      value.memberIds.every((id: unknown) => typeof id === "string");
  }

  if (value.type === "exact" || value.type === "percent") {
    if (!isRecord(value.shares)) {
      return false;
    }

    return Object.values(value.shares).every((share) => typeof share === "number");
  }

  return false;
}

function isExpense(value: unknown): value is Expense {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.description === "string" &&
    typeof value.amount === "number" &&
    Number.isInteger(value.amount) &&
    typeof value.paidBy === "string" &&
    typeof value.date === "string" &&
    isCategory(value.category) &&
    isSplit(value.split);
}

function isMember(value: unknown): value is Member {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string";
}

export function parseExpenses(value: unknown): Expense[] | null {
  if (!Array.isArray(value) || !value.every(isExpense)) {
    return null;
  }

  return value;
}

export function parseAppData(
  value: unknown
): { members: Member[]; expenses: Expense[] } | null {
  if (!isRecord(value) || !Array.isArray(value.members) || !value.members.every(isMember)) {
    return null;
  }

  const expenses = parseExpenses(value.expenses);
  if (expenses === null) {
    return null;
  }

  return { members: value.members, expenses };
}

export function loadExpenses(): { members: Member[]; expenses: Expense[] } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);
      const expenses = parseExpenses(parsed);
      if (expenses !== null) {
        const sampleAppData = parseAppData(sampleData);
        const members = sampleAppData?.members ?? [];
        return { members, expenses };
      }
    }
  } catch (error) {
    console.warn("Could not read saved trip expenses; using the bundled data.", error);
  }

  const appData = parseAppData(sampleData);
  if (appData === null) {
    console.error("The bundled sample data is invalid; starting with empty trip data.");
    return { members: [], expenses: [] };
  }

  return appData;
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.warn("Could not save trip expenses to local storage.", error);
  }
}
