import type { Patient, Lender } from "@prisma/client";

export interface LenderOffer {
  lenderId: string;
  lenderName: string;
  monthlyPayment: number;
  term: number;
  approvalChance: number;
}

export interface EligibilityResult {
  eligible: boolean;
  offers: LenderOffer[];
  newDBR: number;
  existingDebtMonthly: number;
  treatmentMonthly: number;
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

  const offers: LenderOffer[] = [];

  for (const lender of lenders) {
    if (!lender.active) continue;
    if (patient.salaryMonthly < lender.minSalaryMonthly) continue;
    if (newDBR > lender.maxDBR) continue;

    let approvalChance = 0.6;

    if (patient.salaryMonthly > 20000) approvalChance += 0.1;
    if (patient.yearsInUAE > 3) approvalChance += 0.1;
    if (newDBR < 0.3) approvalChance += 0.1;
    if (patient.visaType === "self-employed") approvalChance -= 0.1;

    approvalChance = Math.max(0.1, Math.min(0.9, approvalChance));

    offers.push({
      lenderId: lender.id,
      lenderName: lender.name,
      monthlyPayment: Math.round(treatmentMonthly * 100) / 100,
      term,
      approvalChance: Math.round(approvalChance * 100) / 100,
    });
  }

  return {
    eligible: offers.length > 0,
    offers,
    newDBR: Math.round(newDBR * 1000) / 1000,
    existingDebtMonthly,
    treatmentMonthly,
  };
}
