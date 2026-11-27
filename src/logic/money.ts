/**
 * Parse rupee amount entered by user into integer paise.
 * Uses regex and string handling to avoid floating-point errors.
 * Returns null if input is invalid.
 */
export function parseRupeesToPaise(text: string): number | null {
  const trimmed = text.trim();
  
  // Accept format: digits with optional decimal part (up to 2 decimals)
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(trimmed);
  
  if (!match) {
    return null;
  }
  
  const rupees = match[1];
  const decimals = match[2] || "00";
  
  // Pad decimals to 2 digits
  const paise = decimals.padEnd(2, "0");
  
  // Combine into integer paise
  const result = Number(rupees) * 100 + Number(paise);

  return Number.isSafeInteger(result) ? result : null;
}

/**
 * Format integer paise as Indian rupee format with exactly 2 decimals.
 * Example: 125050 becomes ₹1,250.50
 */
export function formatRupees(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(rupees);
}
