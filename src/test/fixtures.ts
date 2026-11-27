import type { Member, Expense } from "../types";

export const testMembers: Member[] = [
  { id: "m1", name: "Alice" },
  { id: "m2", name: "Bob" },
  { id: "m3", name: "Charlie" },
  { id: "m4", name: "Diana" },
  { id: "m5", name: "Eve" },
];

export const testExpenses: Expense[] = [
  {
    id: "e1",
    description: "Dinner at restaurant",
    amount: 10000,
    paidBy: "m1",
    date: "2024-01-15",
    category: "Food",
    split: { type: "equal", memberIds: ["m1", "m2", "m3"] },
  },
  {
    id: "e2",
    description: "Taxi to hotel",
    amount: 6000,
    paidBy: "m2",
    date: "2024-01-16",
    category: "Travel",
    split: {
      type: "exact",
      shares: { m1: 2000, m2: 2000, m3: 2000 },
    },
  },
  {
    id: "e3",
    description: "Hotel booking",
    amount: 15000,
    paidBy: "m3",
    date: "2024-01-17",
    category: "Stay",
    split: {
      type: "percent",
      shares: { m1: 50, m2: 25, m3: 25 },
    },
  },
  {
    id: "e4",
    description: "Gift for host",
    amount: 5000,
    paidBy: "m5",
    date: "2024-01-18",
    category: "Other",
    split: { type: "equal", memberIds: ["m1", "m2", "m3", "m4"] },
  },
];
