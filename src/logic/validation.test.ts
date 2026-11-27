import { describe, expect, it } from "vitest";
import { validateExpenseForm } from "./validation";
import type { ExpenseFormValues, Member } from "../types";

const members: Member[] = [
  { id: "m1", name: "Alice" },
  { id: "m2", name: "Bob" },
  { id: "m3", name: "Charlie" },
];

const today = "2024-06-15";

const baseValues: ExpenseFormValues = {
  description: "Test expense",
  amount: "100",
  paidBy: "m1",
  date: "2024-06-15",
  category: "Food",
  splitType: "equal",
  equalMemberIds: ["m1", "m2"],
  exactInputs: {},
  percentInputs: {},
};

describe("validateExpenseForm", () => {
  describe("description", () => {
    it("requires description", () => {
      const values = { ...baseValues, description: "" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.description).toBe("Description is required");
      }
    });

    it("rejects description longer than 60 characters", () => {
      const values = { ...baseValues, description: "a".repeat(61) };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.description).toBe("Description must be 60 characters or fewer");
      }
    });
  });

  describe("amount", () => {
    it("requires amount", () => {
      const values = { ...baseValues, amount: "" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.amount).toBe("Amount is required");
      }
    });

    it("rejects negative amount with exact message", () => {
      const values = { ...baseValues, amount: "-5" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.amount).toBe("Amount must be more than ₹0");
      }
    });

    it("rejects zero amount", () => {
      const values = { ...baseValues, amount: "0" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.amount).toBe("Amount must be more than ₹0");
      }
    });

    it("rejects more than 2 decimals", () => {
      const values = { ...baseValues, amount: "10.123" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.amount).toBe("Amount can have at most 2 decimals");
      }
    });

    it("rejects invalid format", () => {
      const values = { ...baseValues, amount: "abc" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.amount).toBe("Enter a valid amount, for example 1250.50");
      }
    });

    it("rejects amount more than ₹10,00,000", () => {
      const values = { ...baseValues, amount: "1000001" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.amount).toBe("Amount must be ₹10,00,000 or less");
      }
    });
  });

  describe("paidBy", () => {
    it("requires paidBy", () => {
      const values = { ...baseValues, paidBy: "" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.paidBy).toBe("Select who paid");
      }
    });

    it("rejects invalid member id", () => {
      const values = { ...baseValues, paidBy: "invalid" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.paidBy).toBe("Select who paid");
      }
    });
  });

  describe("date", () => {
    it("requires date", () => {
      const values = { ...baseValues, date: "" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.date).toBe("Date is required");
      }
    });

    it("rejects future date", () => {
      const values = { ...baseValues, date: "2024-06-16" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.date).toBe("Date cannot be in the future");
      }
    });
  });

  describe("category", () => {
    it("requires category", () => {
      const values = { ...baseValues, category: "" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.category).toBe("Select a category");
      }
    });

    it("rejects invalid category", () => {
      const values = { ...baseValues, category: "Invalid" };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.category).toBe("Select a category");
      }
    });
  });

  describe("equal split", () => {
    it("requires at least one member", () => {
      const values = { ...baseValues, splitType: "equal" as const, equalMemberIds: [] };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.split).toBe("Select at least one member");
      }
    });

    it("accepts valid equal split", () => {
      const values = { ...baseValues, splitType: "equal" as const, equalMemberIds: ["m1", "m2"] };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.expense.split).toEqual({
          type: "equal",
          memberIds: ["m1", "m2"],
        });
      }
    });
  });

  describe("exact split", () => {
    it("rejects invalid member input", () => {
      const values = {
        ...baseValues,
        splitType: "exact" as const,
        amount: "100",
        exactInputs: { m1: "50", m2: "abc" },
      };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.memberErrors?.m2).toBe("Enter an amount of ₹0 or more (up to 2 decimals)");
      }
    });

    it("shows left to assign", () => {
      const values = {
        ...baseValues,
        splitType: "exact" as const,
        amount: "100",
        exactInputs: { m1: "50", m2: "37.50" },
      };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.split).toBe("₹12.50 left to assign");
      }
    });

    it("shows over the amount", () => {
      const values = {
        ...baseValues,
        splitType: "exact" as const,
        amount: "100",
        exactInputs: { m1: "60", m2: "50" },
      };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.split).toBe("₹10.00 over the amount");
      }
    });

    it("accepts valid exact split and drops zero shares", () => {
      const values = {
        ...baseValues,
        splitType: "exact" as const,
        amount: "100",
        exactInputs: { m1: "60", m2: "40", m3: "" },
      };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(true);
      if (result.ok && result.expense.split.type === "exact") {
        expect(result.expense.split).toEqual({
          type: "exact",
          shares: { m1: 6000, m2: 4000 },
        });
        expect(result.expense.split.shares).not.toHaveProperty("m3");
      }
    });
  });

  describe("percent split", () => {
    it("rejects invalid member input", () => {
      const values = {
        ...baseValues,
        splitType: "percent" as const,
        percentInputs: { m1: "50", m2: "abc" },
      };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.memberErrors?.m2).toBe("Enter a percentage between 0 and 100 (up to 2 decimals)");
      }
    });

    it("shows current total when not 100", () => {
      const values = {
        ...baseValues,
        splitType: "percent" as const,
        percentInputs: { m1: "50", m2: "49.5" },
      };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.split).toBe("Percentages must add up to 100 (currently 99.5)");
      }
    });

    it("accepts valid percent split and drops zero shares", () => {
      const values = {
        ...baseValues,
        splitType: "percent" as const,
        percentInputs: { m1: "60", m2: "40", m3: "" },
      };
      const result = validateExpenseForm(values, members, today);
      expect(result.ok).toBe(true);
      if (result.ok && result.expense.split.type === "percent") {
        expect(result.expense.split).toEqual({
          type: "percent",
          shares: { m1: 60, m2: 40 },
        });
        expect(result.expense.split.shares).not.toHaveProperty("m3");
      }
    });
  });

  it("accepts fully valid input for all split types", () => {
    const equalValues = { ...baseValues, splitType: "equal" as const, equalMemberIds: ["m1", "m2"] };
    const equalResult = validateExpenseForm(equalValues, members, today);
    expect(equalResult.ok).toBe(true);

    const exactValues = {
      ...baseValues,
      splitType: "exact" as const,
      amount: "100",
      exactInputs: { m1: "60", m2: "40" },
    };
    const exactResult = validateExpenseForm(exactValues, members, today);
    expect(exactResult.ok).toBe(true);

    const percentValues = {
      ...baseValues,
      splitType: "percent" as const,
      percentInputs: { m1: "60", m2: "40" },
    };
    const percentResult = validateExpenseForm(percentValues, members, today);
    expect(percentResult.ok).toBe(true);
  });
});
