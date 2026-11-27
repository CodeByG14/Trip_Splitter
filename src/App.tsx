import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { NotFound } from "./components/NotFound";
import { AddExpensePage } from "./pages/AddExpensePage";
import { ExpensesPage } from "./pages/ExpensesPage";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ExpensesPage />} />
        <Route path="/expenses/new" element={<AddExpensePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
