import type { LenderMatch } from "@/modules/eligibility/engine";

export function selectTopMatch(
  matches: LenderMatch[]
): LenderMatch | null {
  if (matches.length === 0) return null;
  return matches[0]; // Already sorted by matchScore descending
}
