import type { Expense, Member } from "../types";
import { formatRupees } from "../logic/money";
import { describeSplit } from "../logic/split";

type ExpenseTableProps = {
  expenses: Expense[];
  members: Member[];
  onDelete: (id: string, description: string) => void;
};

export function ExpenseTable({ expenses, members, onDelete }: ExpenseTableProps) {
  if (expenses.length === 0) {
    return null;
  }

  // Sort expenses by date, newest first
  const sorted = [...expenses].sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || id;
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Paid by</th>
            <th>Amount</th>
            <th>Split</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.date}</td>
              <td>{expense.description}</td>
              <td>{expense.category}</td>
              <td>{getMemberName(expense.paidBy)}</td>
              <td>{formatRupees(expense.amount)}</td>
              <td>{describeSplit(expense.split)}</td>
              <td>
                <button
                  className="btn-delete"
                  onClick={() => onDelete(expense.id, expense.description)}
                  aria-label={`Delete ${expense.description}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
