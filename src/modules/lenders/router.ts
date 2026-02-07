import type { LenderOffer } from "@/modules/eligibility/engine";

export function selectBestLender(
  offers: LenderOffer[]
): LenderOffer | null {
  if (offers.length === 0) return null;

  return offers.reduce((best, current) =>
    current.approvalChance > best.approvalChance ? current : best
  );
}
