/**
 * Create a unique ID for an expense.
 * Uses timestamp in base36 plus a random suffix.
 * Not using crypto.randomUUID() due to unreliability in jsdom test environment.
 */
export function createId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}
