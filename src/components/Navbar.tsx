import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <NavLink to="/" end>
            Expenses
          </NavLink>
        </li>
        <li>
          <NavLink to="/expenses/new">Add expense</NavLink>
        </li>
      </ul>
    </nav>
  );
}
