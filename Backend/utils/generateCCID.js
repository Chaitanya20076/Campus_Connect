
import { randomBytes } from "node:crypto";

export function generateCCID() {
  const year = new Date().getFullYear();

  const uniquePart = randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `CC-${year}-${uniquePart}`;
}
