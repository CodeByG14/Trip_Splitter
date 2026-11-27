import type {
  ExpenseFormValues,
  FormErrors,
  NewExpense,
  Member,
  Category,
} from "../types";
import { CATEGORIES } from "../types";
import { parseRupeesToPaise, formatRupees } from "./money";

function isCategory(value: string): value is Category {
  return CATEGORIES.some((category) => category === value);
}

function parsePercentToBasisPoints(value: string): number | null {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) {
    return null;
  }

  const whole = Number(match[1]);
  const decimals = Number((match[2] ?? "").padEnd(2, "0"));
  const basisPoints = whole * 100 + decimals;
  return basisPoints <= 10000 ? basisPoints : null;
}

function formatBasisPoints(basisPoints: number): string {
  const whole = Math.floor(basisPoints / 100);
  const decimals = String(basisPoints % 100).padStart(2, "0").replace(/0+$/, "");
  return decimals === "" ? String(whole) : `${whole}.${decimals}`;
}

type ValidationResult =
  | { ok: true; expense: NewExpense }
  | { ok: false; errors: FormErrors };

/**
 * Validate expense form values and convert to NewExpense if valid.
 * Returns all errors at once.
 */
export function validateExpenseForm(
  values: ExpenseFormValues,
  members: Member[],
  today: string
): ValidationResult {
  const errors: FormErrors = {};
  const memberErrors: Record<string, string> = {};
  const category = values.category;
  const selectedCategory = isCategory(category) ? category : null;

  // Description
  const trimmedDesc = values.description.trim();
  if (trimmedDesc === "") {
    errors.description = "Description is required";
  } else if (trimmedDesc.length > 60) {
    errors.description = "Description must be 60 characters or fewer";
  }

  // Amount
  const trimmedAmount = values.amount.trim();
  let amountPaise: number | null = null;

  if (trimmedAmount === "") {
    errors.amount = "Amount is required";
  } else {
    const parsedAmount = parseRupeesToPaise(trimmedAmount);
    if (trimmedAmount.startsWith("-") || /^0+(?:\.0+)?$/.test(trimmedAmount)) {
      errors.amount = "Amount must be more than ₹0";
    } else if (trimmedAmount.includes(".") && trimmedAmount.split(".")[1].length > 2) {
      errors.amount = "Amount can have at most 2 decimals";
    } else {
      amountPaise = parsedAmount;
      if (amountPaise === null) {
        errors.amount = "Enter a valid amount, for example 1250.50";
      } else if (amountPaise > 100000000) {
        errors.amount = "Amount must be ₹10,00,000 or less";
      }
    }
  }

  // Paid by
  const memberIds = members.map((m) => m.id);
  if (!values.paidBy || !memberIds.includes(values.paidBy)) {
    errors.paidBy = "Select who paid";
  }

  // Date
  if (!values.date) {
    errors.date = "Date is required";
  } else if (values.date > today) {
    errors.date = "Date cannot be in the future";
  }

  // Category
  if (selectedCategory === null) {
    errors.category = "Select a category";
  }

  // Split validation
  let splitData: NewExpense["split"] | null = null;

  if (values.splitType === "equal") {
    if (values.equalMemberIds.length === 0) {
      errors.split = "Select at least one member";
    } else {
      // Sort in members-list order
      const orderedIds = members
        .filter((m) => values.equalMemberIds.includes(m.id))
        .map((m) => m.id);
      splitData = { type: "equal", memberIds: orderedIds };
    }
  } else if (values.splitType === "exact") {
    // Validate each member's exact input
    const shares: Record<string, number> = {};
    let allValid = true;

    memberIds.forEach((id) => {
      const input = (values.exactInputs[id] || "").trim();
      const paise = input === "" ? 0 : parseRupeesToPaise(input);

      if (paise === null || paise < 0) {
        memberErrors[id] = "Enter an amount of ₹0 or more (up to 2 decimals)";
        allValid = false;
      } else if (input.includes(".") && input.split(".")[1].length > 2) {
        memberErrors[id] = "Enter an amount of ₹0 or more (up to 2 decimals)";
        allValid = false;
      } else if (paise > 0) {
        shares[id] = paise;
      }
    });

    if (allValid && amountPaise !== null) {
      const total = Object.values(shares).reduce((sum, s) => sum + s, 0);
      if (total < amountPaise) {
        const diff = amountPaise - total;
        errors.split = `${formatRupees(diff)} left to assign`;
      } else if (total > amountPaise) {
        const diff = total - amountPaise;
        errors.split = `${formatRupees(diff)} over the amount`;
      } else {
        splitData = { type: "exact", shares };
      }
    }
  } else if (values.splitType === "percent") {
    // Validate each member's percent input
    const shares: Record<string, number> = {};
    let allValid = true;
    let totalBasisPoints = 0;

    memberIds.forEach((id) => {
      const input = (values.percentInputs[id] || "").trim();
      
      if (input === "") {
        return;
      }

      const basisPoints = parsePercentToBasisPoints(input);
      if (basisPoints === null) {
        memberErrors[id] = "Enter a percentage between 0 and 100 (up to 2 decimals)";
        allValid = false;
        return;
      }

      totalBasisPoints += basisPoints;
      if (basisPoints > 0) {
        shares[id] = basisPoints / 100;
      }
    });

    if (allValid) {
      if (totalBasisPoints !== 10000) {
        errors.split = `Percentages must add up to 100 (currently ${formatBasisPoints(totalBasisPoints)})`;
      } else {
        splitData = { type: "percent", shares };
      }
    }
  }

  // Collect member errors if any
  if (Object.keys(memberErrors).length > 0) {
    errors.memberErrors = memberErrors;
  }

  // If there are any errors, return them
  if (
    errors.description ||
    errors.amount ||
    errors.paidBy ||
    errors.date ||
    errors.category ||
    selectedCategory === null ||
    errors.split ||
    errors.memberErrors
  ) {
    return { ok: false, errors };
  }

  // All valid, build the NewExpense
  if (!splitData || amountPaise === null) {
    // Should not happen if validation is correct
    return { ok: false, errors: { split: "Invalid split data" } };
  }

  const expense: NewExpense = {
    description: trimmedDesc,
    amount: amountPaise,
    paidBy: values.paidBy,
    date: values.date,
    category: selectedCategory,
    split: splitData,
  };

  return { ok: true, expense };
}
