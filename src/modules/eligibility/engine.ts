import type { Patient, Lender } from "@prisma/client";

export type MatchLabel =
  | "Very strong match"
  | "Strong match"
  | "Possible match"
  | "Unlikely";

export interface LenderMatch {
  lenderId: string;
  lenderName: string;
  matchScore: number;
  matchLabel: MatchLabel;
  rank: number;
  monthlyPayment: number;
  term: number;
}

export interface EligibilityResult {
  eligible: boolean;
  matches: LenderMatch[];
  newDBR: number;
  existingDebtMonthly: number;
  treatmentMonthly: number;
}

function scoreToLabel(score: number): MatchLabel {
  if (score >= 0.85) return "Very strong match";
  if (score >= 0.65) return "Strong match";
  if (score >= 0.45) return "Possible match";
  return "Unlikely";
}

export function evaluate(
  patient: Patient,
  treatmentCost: number,
  lenders: Lender[]
): EligibilityResult {
  const existingDebtMonthly =
    patient.mortgageMonthly + patient.carLoanMonthly + patient.otherDebtMonthly;

  const term = 12;
  const treatmentMonthly = treatmentCost / term;

  const newDBR =
    (existingDebtMonthly + treatmentMonthly) / patient.salaryMonthly;

  const scored: LenderMatch[] = [];

  for (const lender of lenders) {
    if (!lender.active) continue;
    if (patient.salaryMonthly < lender.minSalaryMonthly) continue;
    if (newDBR > lender.maxDBR) continue;

    let matchScore = 0.5;

    if (patient.salaryMonthly > lender.minSalaryMonthly * 1.5)
      matchScore += 0.15;
    if (newDBR < 0.3) matchScore += 0.1;
    if (patient.yearsInUAE > 3) matchScore += 0.1;
    if (newDBR > 0.45) matchScore -= 0.2;
    if (patient.visaType === "self-employed") matchScore -= 0.1;

    matchScore = Math.max(0, Math.min(1, matchScore));

    scored.push({
      lenderId: lender.id,
      lenderName: lender.name,
      matchScore: Math.round(matchScore * 1000) / 1000,
      matchLabel: scoreToLabel(matchScore),
      rank: 0,
      monthlyPayment: Math.round(treatmentMonthly * 100) / 100,
      term,
    });
  }

  scored.sort((a, b) => b.matchScore - a.matchScore);
  const top3 = scored.slice(0, 3);
  top3.forEach((match, i) => {
    match.rank = i + 1;
  });

  return {
    eligible: top3.length > 0,
    matches: top3,
    newDBR: Math.round(newDBR * 1000) / 1000,
    existingDebtMonthly,
    treatmentMonthly,
  };
}
