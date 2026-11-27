import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="container">
      <div className="empty-state">
        <h1>Page not found</h1>
        <p>
          <Link to="/">Go back to Expenses</Link>
        </p>
      </div>
    </div>
  );
}
