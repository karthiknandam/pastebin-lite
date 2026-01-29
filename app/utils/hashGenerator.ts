import { randomBytes } from "crypto";

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateHash(): string {
  const bytes = randomBytes(7);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}
