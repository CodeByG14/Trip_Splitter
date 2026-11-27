export type Member = {
  id: string;
  name: string;
};

export const CATEGORIES = ["Food", "Travel", "Stay", "Activities", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

export type SplitEqual = {
  type: "equal";
  memberIds: string[];
};

export type SplitExact = {
  type: "exact";
  shares: Record<string, number>; // paise per member
};

export type SplitPercent = {
  type: "percent";
  shares: Record<string, number>; // percent per member
};

export type Split = SplitEqual | SplitExact | SplitPercent;

export type Expense = {
  id: string;
  description: string;
  amount: number; // paise
  paidBy: string; // member id
  date: string; // YYYY-MM-DD
  category: Category;
  split: Split;
};

export type NewExpense = Omit<Expense, "id">;

export type ExpenseFormValues = {
  description: string;
  amount: string;
  paidBy: string;
  date: string;
  category: string;
  splitType: "equal" | "exact" | "percent";
  equalMemberIds: string[];
  exactInputs: Record<string, string>;
  percentInputs: Record<string, string>;
};

export type FormErrors = {
  description?: string;
  amount?: string;
  paidBy?: string;
  date?: string;
  category?: string;
  split?: string;
  memberErrors?: Record<string, string>;
};
