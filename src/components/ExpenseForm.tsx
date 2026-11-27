import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createId } from "../logic/ids";
import { getToday } from "../logic/dates";
import { validateExpenseForm } from "../logic/validation";
import { expenseAdded, selectMembers } from "../store/expensesSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { CATEGORIES, type ExpenseFormValues, type FormErrors } from "../types";

function ErrorMessage({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="error" id={id} role="alert">
      {message}
    </p>
  );
}

export function ExpenseForm() {
  const dispatch = useAppDispatch();
  const members = useAppSelector(selectMembers);
  const navigate = useNavigate();
  const today = getToday();
  const [values, setValues] = useState<ExpenseFormValues>(() => ({
    description: "",
    amount: "",
    paidBy: "",
    date: getToday(),
    category: "",
    splitType: "equal",
    equalMemberIds: members.map((member) => member.id),
    exactInputs: {},
    percentInputs: {},
  }));
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateExpenseForm(values, members, today);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    dispatch(expenseAdded({ ...result.expense, id: createId() }));
    navigate("/", { state: { message: "Expense added" } });
  }

  function toggleEqualMember(memberId: string) {
    setValues((current) => {
      const selected = current.equalMemberIds.includes(memberId);
      return {
        ...current,
        equalMemberIds: selected
          ? current.equalMemberIds.filter((id) => id !== memberId)
          : [...current.equalMemberIds, memberId],
      };
    });
  }

  return (
    <form className="card expense-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        <ErrorMessage id="description-error" message={errors.description} />
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount (₹)</label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          value={values.amount}
          onChange={(event) =>
            setValues((current) => ({ ...current, amount: event.target.value }))
          }
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? "amount-error" : undefined}
        />
        <ErrorMessage id="amount-error" message={errors.amount} />
      </div>

      <div className="form-group">
        <label htmlFor="paid-by">Paid by</label>
        <select
          id="paid-by"
          value={values.paidBy}
          onChange={(event) =>
            setValues((current) => ({ ...current, paidBy: event.target.value }))
          }
          aria-invalid={Boolean(errors.paidBy)}
          aria-describedby={errors.paidBy ? "paid-by-error" : undefined}
        >
          <option value="">Select...</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        <ErrorMessage id="paid-by-error" message={errors.paidBy} />
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          max={today}
          value={values.date}
          onChange={(event) =>
            setValues((current) => ({ ...current, date: event.target.value }))
          }
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? "date-error" : undefined}
        />
        <ErrorMessage id="date-error" message={errors.date} />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={values.category}
          onChange={(event) =>
            setValues((current) => ({ ...current, category: event.target.value }))
          }
          aria-invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? "category-error" : undefined}
        >
          <option value="">Select...</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <ErrorMessage id="category-error" message={errors.category} />
      </div>

      <fieldset
        className="split-fieldset"
        aria-invalid={Boolean(errors.split)}
        aria-describedby={errors.split ? "split-error" : undefined}
      >
        <legend>Split</legend>
        <div className="choice-list split-type-choices">
          <label className="choice-label">
            <input
              type="radio"
              name="split-type"
              value="equal"
              checked={values.splitType === "equal"}
              onChange={() =>
                setValues((current) => ({ ...current, splitType: "equal" }))
              }
            />
            Equally
          </label>
          <label className="choice-label">
            <input
              type="radio"
              name="split-type"
              value="exact"
              checked={values.splitType === "exact"}
              onChange={() =>
                setValues((current) => ({ ...current, splitType: "exact" }))
              }
            />
            Exact amounts
          </label>
          <label className="choice-label">
            <input
              type="radio"
              name="split-type"
              value="percent"
              checked={values.splitType === "percent"}
              onChange={() =>
                setValues((current) => ({ ...current, splitType: "percent" }))
              }
            />
            Percentages
          </label>
        </div>

        {values.splitType === "equal" && (
          <div className="choice-list member-choice-list">
            {members.map((member) => (
              <label className="choice-label" key={member.id}>
                <input
                  type="checkbox"
                  checked={values.equalMemberIds.includes(member.id)}
                  onChange={() => toggleEqualMember(member.id)}
                />
                {member.name}
              </label>
            ))}
            {members.length === 0 && <p>No trip members are available yet.</p>}
          </div>
        )}

        {values.splitType === "exact" && (
          <div className="member-input-grid">
            {members.map((member) => {
              const error = errors.memberErrors?.[member.id];
              const inputId = `exact-${member.id}`;
              const errorId = `${inputId}-error`;
              return (
                <div className="form-group" key={member.id}>
                  <label htmlFor={inputId}>{member.name} amount (₹)</label>
                  <input
                    id={inputId}
                    type="text"
                    inputMode="decimal"
                    value={values.exactInputs[member.id] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        exactInputs: {
                          ...current.exactInputs,
                          [member.id]: event.target.value,
                        },
                      }))
                    }
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                  />
                  <ErrorMessage id={errorId} message={error} />
                </div>
              );
            })}
          </div>
        )}

        {values.splitType === "percent" && (
          <div className="member-input-grid">
            {members.map((member) => {
              const error = errors.memberErrors?.[member.id];
              const inputId = `percent-${member.id}`;
              const errorId = `${inputId}-error`;
              return (
                <div className="form-group" key={member.id}>
                  <label htmlFor={inputId}>{member.name} percentage (%)</label>
                  <input
                    id={inputId}
                    type="text"
                    inputMode="decimal"
                    value={values.percentInputs[member.id] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        percentInputs: {
                          ...current.percentInputs,
                          [member.id]: event.target.value,
                        },
                      }))
                    }
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                  />
                  <ErrorMessage id={errorId} message={error} />
                </div>
              );
            })}
          </div>
        )}
        <ErrorMessage id="split-error" message={errors.split} />
      </fieldset>

      <div className="form-actions">
        <button className="btn-primary" type="submit">
          Save
        </button>
        <button className="btn-secondary" type="button" onClick={() => navigate("/")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
