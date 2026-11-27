import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BalanceList } from "../components/BalanceList";
import { ExpenseTable } from "../components/ExpenseTable";
import { expenseDeleted, selectExpenses, selectMembers } from "../store/expensesSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { computeBalances } from "../logic/balances";
import { formatRupees } from "../logic/money";
import { CATEGORIES } from "../types";

function getMessage(state: unknown): string | null {
  if (typeof state !== "object" || state === null || !("message" in state)) {
    return null;
  }

  const { message } = state;
  return typeof message === "string" && message.length > 0 ? message : null;
}

export function ExpensesPage() {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector(selectExpenses);
  const members = useAppSelector(selectMembers);
  const location = useLocation();
  const [category, setCategory] = useState("All");

  const filteredExpenses =
    category === "All"
      ? expenses
      : expenses.filter((expense) => expense.category === category);
  const totalShown = filteredExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );
  const message = getMessage(location.state);

  function handleDelete(id: string, description: string) {
    if (window.confirm(`Delete "${description}"? This cannot be undone.`)) {
      dispatch(expenseDeleted(id));
    }
  }

  return (
    <main className="container">
      <h1>Expenses</h1>
      {message && (
        <p className="message" role="status">
          {message}
        </p>
      )}

      <section aria-labelledby="balances-heading">
        <h2 id="balances-heading">Balances</h2>
        <BalanceList
          members={members}
          balances={computeBalances(members, expenses)}
        />
      </section>

      <section className="card" aria-labelledby="expenses-heading">
        <h2 id="expenses-heading">Expense list</h2>

        {expenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses yet.</p>
            <Link to="/expenses/new">Add your first expense</Link>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="category-filter">Filter by category</label>
              <select
                id="category-filter"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="All">All</option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {filteredExpenses.length === 0 ? (
              <p className="empty-state">
                No expenses in the {category} category.
              </p>
            ) : (
              <ExpenseTable
                expenses={filteredExpenses}
                members={members}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
        <p className="total-shown">Total shown: {formatRupees(totalShown)}</p>
      </section>
    </main>
  );
}
