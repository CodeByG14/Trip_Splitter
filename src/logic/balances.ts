import type { Expense, Member } from "../types";
import { computeShares } from "./split";

/**
 * Compute balance for each member: paid minus their share.
 * Positive means they get money back, negative means they owe.
 * Returns a Record mapping member IDs to their balance in paise.
 * 
 * The sum of all balances is always exactly 0 (guaranteed when every
 * expense's shares sum to its amount).
 */
export function computeBalances(
  members: Member[],
  expenses: Expense[]
): Record<string, number> {
  const balances: Record<string, number> = {};

  // Initialize all members to 0
  members.forEach((member) => {
    balances[member.id] = 0;
  });

  // For each expense, add what was paid and subtract the shares
  expenses.forEach((expense) => {
    // Add what the payer paid
    if (balances[expense.paidBy] !== undefined) {
      balances[expense.paidBy] += expense.amount;
    }

    // Subtract each member's share
    const shares = computeShares(expense, members);
    Object.entries(shares).forEach(([memberId, share]) => {
      if (balances[memberId] !== undefined) {
        balances[memberId] -= share;
      }
    });
  });

  return balances;
}
