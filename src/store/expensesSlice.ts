import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Member, Expense } from "../types";

type ExpensesState = {
  members: Member[];
  expenses: Expense[];
};

const initialState: ExpensesState = {
  members: [],
  expenses: [],
};

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    expenseAdded: (state, action: PayloadAction<Expense>) => {
      state.expenses.push(action.payload);
    },
    expenseDeleted: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
    },
    dataLoaded: (state, action: PayloadAction<{ members: Member[]; expenses: Expense[] }>) => {
      state.members = action.payload.members;
      state.expenses = action.payload.expenses;
    },
  },
});

export const { expenseAdded, expenseDeleted, dataLoaded } = expensesSlice.actions;

export const selectMembers = (state: { expenses: ExpensesState }) => state.expenses.members;
export const selectExpenses = (state: { expenses: ExpensesState }) => state.expenses.expenses;

export default expensesSlice.reducer;
