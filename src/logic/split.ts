import type { Expense, Member, Split } from "../types";

function percentageToBasisPoints(percent: number): number {
  const text = String(percent);
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) {
    throw new Error(`Invalid stored percentage: ${text}`);
  }

  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

/**
 * Compute shares for each member in an expense's split.
 * Returns a Record mapping member IDs to their share in paise.
 * 
 * Extra-paisa rule: Floor every share, then give leftover paise one each
 * to the first people in members-list order (not the order the user selected them).
 */
export function computeShares(
  expense: Expense,
  members: Member[]
): Record<string, number> {
  const { split, amount } = expense;

  switch (split.type) {
    case "equal": {
      const count = split.memberIds.length;
      if (count === 0) {
        return {};
      }

      const base = Math.floor(amount / count);
      const leftover = amount - base * count;

      // Sort member IDs in members-list order
      const orderedIds = members
        .filter((m) => split.memberIds.includes(m.id))
        .map((m) => m.id);

      const shares: Record<string, number> = {};
      orderedIds.forEach((id, index) => {
        // First 'leftover' members get base + 1, rest get base
        shares[id] = index < leftover ? base + 1 : base;
      });

      return shares;
    }

    case "exact": {
      // Exact shares are used as stored
      return split.shares;
    }

    case "percent": {
      // Convert each percentage to basis points, compute share, distribute leftover
      const memberIds = Object.keys(split.shares);
      
      // Sort member IDs in members-list order
      const orderedIds = members
        .filter((m) => memberIds.includes(m.id))
        .map((m) => m.id);

      const shares: Record<string, number> = {};
      let total = 0;

      orderedIds.forEach((id) => {
        const percent = split.shares[id];
        // Convert percentage to basis points (33.33 becomes 3333)
        const basisPoints = percentageToBasisPoints(percent);
        const share = Math.floor((amount * basisPoints) / 10000);
        shares[id] = share;
        total += share;
      });

      // Distribute leftover paise to first members in members-list order
      let leftover = amount - total;
      let index = 0;
      while (leftover > 0 && index < orderedIds.length) {
        shares[orderedIds[index]] += 1;
        leftover -= 1;
        index += 1;
      }

      return shares;
    }

    default: {
      // Exhaustiveness check
      const _never: never = split;
      return _never;
    }
  }
}

/**
 * Generate a human-readable description of a split.
 * Example: "Equally, 4 people" or "Exact amounts, 1 person"
 */
export function describeSplit(split: Split): string {
  let count: number;
  let type: string;

  switch (split.type) {
    case "equal":
      count = split.memberIds.length;
      type = "Equally";
      break;
    case "exact":
      count = Object.keys(split.shares).length;
      type = "Exact amounts";
      break;
    case "percent":
      count = Object.keys(split.shares).length;
      type = "Percentages";
      break;
    default: {
      const _never: never = split;
      return _never;
    }
  }

  const people = count === 1 ? "1 person" : `${count} people`;
  return `${type}, ${people}`;
}
