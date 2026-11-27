import { describe, expect, it } from "vitest";
import { parseRupeesToPaise, formatRupees } from "./money";

describe("parseRupeesToPaise", () => {
  it("parses valid integers", () => {
    expect(parseRupeesToPaise("10")).toBe(1000);
    expect(parseRupeesToPaise("1250")).toBe(125000);
  });

  it("parses valid decimals", () => {
    expect(parseRupeesToPaise("1250.5")).toBe(125050);
    expect(parseRupeesToPaise("1250.50")).toBe(125050);
    expect(parseRupeesToPaise("10.99")).toBe(1099);
  });

  it("rejects invalid inputs", () => {
    expect(parseRupeesToPaise("abc")).toBeNull();
    expect(parseRupeesToPaise("1.234")).toBeNull();
    expect(parseRupeesToPaise("-5")).toBeNull();
    expect(parseRupeesToPaise("")).toBeNull();
    expect(parseRupeesToPaise("1e5")).toBeNull();
    expect(parseRupeesToPaise(".5")).toBeNull();
    expect(parseRupeesToPaise("5.")).toBeNull();
  });

  it("handles zero", () => {
    expect(parseRupeesToPaise("0")).toBe(0);
    expect(parseRupeesToPaise("0.00")).toBe(0);
  });
});

describe("formatRupees", () => {
  it("formats amounts with Indian format", () => {
    expect(formatRupees(10000000)).toBe("₹1,00,000.00");
    expect(formatRupees(125050)).toBe("₹1,250.50");
    expect(formatRupees(0)).toBe("₹0.00");
  });
});
