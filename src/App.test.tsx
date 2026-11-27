import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import App from "./App";
import { renderWithProviders } from "./test/renderWithProviders";

describe("App routes", () => {
  it("marks the current navigation link", () => {
    renderWithProviders(<App />, { initialEntries: ["/expenses/new"] });

    expect(screen.getByRole("link", { name: "Add expense" }).getAttribute("aria-current"))
      .toBe("page");
    expect(screen.getByRole("link", { name: "Expenses" }).getAttribute("aria-current"))
      .toBeNull();
  });

  it("shows a not-found page with a link back to Expenses", () => {
    renderWithProviders(<App />, { initialEntries: ["/unknown"] });

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go back to Expenses" }).getAttribute("href"))
      .toBe("/");
  });
});
