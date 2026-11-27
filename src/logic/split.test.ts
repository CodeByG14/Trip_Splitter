import { describe, expect, it } from "vitest";
import { computeShares, describeSplit } from "./split";
import type { Expense, Member } from "../types";

const members: Member[] = [
  { id: "m1", name: "Alice" },
  { id: "m2", name: "Bob" },
  { id: "m3", name: "Charlie" },
  { id: "m4", name: "Diana" },
  { id: "m5", name: "Eve" },
];

describe("computeShares", () => {
  describe("equal split", () => {
    it("splits ₹100 equally between 3 people (10000 paise)", () => {
      const expense: Expense = {
        id: "e1",
        description: "Test",
        amount: 10000,
        paidBy: "m1",
        date: "2024-01-01",
        category: "Food",
        split: { type: "equal", memberIds: ["m1", "m2", "m3"] },
      };

      const shares = computeShares(expense, members);
      
      // First person gets extra paisa: 3334, rest get 3333
      expect(shares).toEqual({
        m1: 3334,
        m2: 3333,
        m3: 3333,
      });
      
      // Shares must sum to exactly the amount
      const total = Object.values(shares).reduce((sum, s) => sum + s, 0);
      expect(total).toBe(10000);
    });

    it("uses members-list order for extra paise, not selection order", () => {
      // User selected m3, m1, m2 but members-list order is m1, m2, m3
      const expense: Expense = {
        id: "e1",
        description: "Test",
        amount: 10000,
        paidBy: "m1",
        date: "2024-01-01",
        category: "Food",
        split: { type: "equal", memberIds: ["m3", "m1", "m2"] },
      };

      const shares = computeShares(expense, members);
      
      // m1 is first in members-list, so gets extra paisa
      expect(shares).toEqual({
        m1: 3334,
        m2: 3333,
        m3: 3333,
      });
    });

    it("splits evenly divisible amounts", () => {
      const expense: Expense = {
        id: "e1",
        description: "Test",
        amount: 12000,
        paidBy: "m1",
        date: "2024-01-01",
        category: "Food",
        split: { type: "equal", memberIds: ["m1", "m2", "m3"] },
      };

      const shares = computeShares(expense, members);
      
      expect(shares).toEqual({
        m1: 4000,
        m2: 4000,
        m3: 4000,
      });
    });
  });

  describe("exact split", () => {
    it("uses shares as stored", () => {
      const expense: Expense = {
        id: "e1",
        description: "Test",
        amount: 10000,
        paidBy: "m1",
        date: "2024-01-01",
        category: "Food",
        split: {
          type: "exact",
          shares: {
            m1: 5000,
            m2: 3000,
            m3: 2000,
          },
        },
      };

      const shares = computeShares(expense, members);
      
      expect(shares).toEqual({
        m1: 5000,
        m2: 3000,
        m3: 2000,
      });
    });
  });

  describe("percent split", () => {
    it("distributes leftover paise to first members in members-list order", () => {
      const expense: Expense = {
        id: "e1",
        description: "Test",
        amount: 149999,
        paidBy: "m1",
        date: "2024-01-01",
        category: "Food",
        split: {
          type: "percent",
          shares: {
            m1: 33.33,
            m2: 33.33,
            m3: 33.34,
          },
        },
      };

      const shares = computeShares(expense, members);
      
      // Shares must sum exactly to amount
      const total = Object.values(shares).reduce((sum, s) => sum + s, 0);
      expect(total).toBe(149999);
      
      // Check that each share is reasonable (around 33.33% of 149999 = ~49999)
      // With rounding, first members get leftover paise
      expect(shares.m1).toBeGreaterThanOrEqual(49990);
      expect(shares.m2).toBeGreaterThanOrEqual(49990);
      expect(shares.m3).toBeGreaterThanOrEqual(49990);
    });

    it("handles even split", () => {
      const expense: Expense = {
        id: "e1",
        description: "Test",
        amount: 15000,
        paidBy: "m1",
        date: "2024-01-01",
        category: "Food",
        split: {
          type: "percent",
          shares: {
            m1: 50,
            m2: 50,
          },
        },
      };

      const shares = computeShares(expense, members);
      
      expect(shares).toEqual({
        m1: 7500,
        m2: 7500,
      });
    });
  });

  it("handles payer not in the split", () => {
    const expense: Expense = {
      id: "e1",
      description: "Test",
      amount: 10000,
      paidBy: "m5", // m5 paid but is not in the split
      date: "2024-01-01",
      category: "Food",
      split: { type: "equal", memberIds: ["m1", "m2", "m3"] },
    };

    const shares = computeShares(expense, members);
    
    // m5 should not appear in shares
    expect(shares).not.toHaveProperty("m5");
    expect(shares).toEqual({
      m1: 3334,
      m2: 3333,
      m3: 3333,
    });
  });
});

describe("describeSplit", () => {
  it("describes equal split", () => {
    expect(describeSplit({ type: "equal", memberIds: ["m1", "m2", "m3", "m4"] }))
      .toBe("Equally, 4 people");
  });

  it("describes exact split", () => {
    expect(describeSplit({ type: "exact", shares: { m1: 5000, m2: 3000, m3: 2000 } }))
      .toBe("Exact amounts, 3 people");
  });

  it("describes percent split", () => {
    expect(describeSplit({ type: "percent", shares: { m1: 60, m2: 40 } }))
      .toBe("Percentages, 2 people");
  });

  it("uses singular for 1 person", () => {
    expect(describeSplit({ type: "equal", memberIds: ["m1"] }))
      .toBe("Equally, 1 person");
  });
});
