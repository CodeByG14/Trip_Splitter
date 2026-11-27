import { describe, expect, it } from "vitest";
import { computeBalances } from "./balances";
import type { Expense, Member } from "../types";

const members: Member[] = [
  { id: "m1", name: "Alice" },
  { id: "m2", name: "Bob" },
  { id: "m3", name: "Charlie" },
];

describe("computeBalances", () => {
  it("computes balances with all three split types", () => {
    const expenses: Expense[] = [
      {
        id: "e1",
        description: "Dinner",
        amount: 10000,
        paidBy: "m1",
        date: "2024-01-01",
        category: "Food",
        split: { type: "equal", memberIds: ["m1", "m2", "m3"] },
      },
      {
        id: "e2",
        description: "Taxi",
        amount: 6000,
        paidBy: "m2",
        date: "2024-01-02",
        category: "Travel",
        split: {
          type: "exact",
          shares: { m1: 2000, m2: 2000, m3: 2000 },
        },
      },
      {
        id: "e3",
        description: "Hotel",
        amount: 15000,
        paidBy: "m3",
        date: "2024-01-03",
        category: "Stay",
        split: {
          type: "percent",
          shares: { m1: 50, m2: 25, m3: 25 },
        },
      },
    ];

    const balances = computeBalances(members, expenses);

    // m1: paid 10000, owes (3334 + 2000 + 7500) = 12834, balance = -2834
    // m2: paid 6000, owes (3333 + 2000 + 3750) = 9083, balance = -3083
    // m3: paid 15000, owes (3333 + 2000 + 3750) = 9083, balance = +5917
    
    expect(balances.m1).toBe(10000 - 3334 - 2000 - 7500);
    expect(balances.m2).toBe(6000 - 3333 - 2000 - 3750);
    expect(balances.m3).toBe(15000 - 3333 - 2000 - 3750);

    // Sum of all balances must be exactly 0
    const total = Object.values(balances).reduce((sum, b) => sum + b, 0);
    expect(total).toBe(0);
  });

  it("handles payer not in the split", () => {
    const expenses: Expense[] = [
      {
        id: "e1",
        description: "Gift",
        amount: 10000,
        paidBy: "m3", // m3 pays but is not in the split
        date: "2024-01-01",
        category: "Other",
        split: { type: "equal", memberIds: ["m1", "m2"] },
      },
    ];

    const balances = computeBalances(members, expenses);

    // m1 and m2 each owe 5000
    expect(balances.m1).toBe(-5000);
    expect(balances.m2).toBe(-5000);
    // m3 paid 10000 and owes nothing
    expect(balances.m3).toBe(10000);

    const total = Object.values(balances).reduce((sum, b) => sum + b, 0);
    expect(total).toBe(0);
  });

  it("handles member with no activity", () => {
    const membersWithExtra: Member[] = [
      ...members,
      { id: "m4", name: "Diana" },
    ];

    const expenses: Expense[] = [
      {
        id: "e1",
        description: "Lunch",
        amount: 6000,
        paidBy: "m1",
        date: "2024-01-01",
        category: "Food",
        split: { type: "equal", memberIds: ["m1", "m2"] },
      },
    ];

    const balances = computeBalances(membersWithExtra, expenses);

    // m4 has no activity, should be 0 (settled up)
    expect(balances.m4).toBe(0);

    const total = Object.values(balances).reduce((sum, b) => sum + b, 0);
    expect(total).toBe(0);
  });

  it("returns all zeros for no expenses", () => {
    const balances = computeBalances(members, []);

    expect(balances).toEqual({
      m1: 0,
      m2: 0,
      m3: 0,
    });
  });
});
