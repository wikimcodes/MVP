import { prisma } from "@/lib/db";
import { evaluate } from "@/modules/eligibility/engine";
import { selectTopMatch } from "@/modules/lenders/router";
import { logEvent } from "@/modules/events/logger";

export interface ApplicationInput {
  clinicId: string;
  emiratesId: string;
  name: string;
  phone: string;
  email: string;
  nationality: string;
  visaType: string;
  yearsInUAE: number;
  employer: string;
  salaryMonthly: number;
  mortgageMonthly: number;
  carLoanMonthly: number;
  otherDebtMonthly: number;
  treatmentType: string;
  treatmentCost: number;
}

export async function submitApplication(input: ApplicationInput) {
  const patient = await prisma.patient.create({
    data: {
      emiratesId: input.emiratesId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      nationality: input.nationality,
      visaType: input.visaType,
      yearsInUAE: input.yearsInUAE,
      employer: input.employer,
      salaryMonthly: input.salaryMonthly,
      mortgageMonthly: input.mortgageMonthly,
      carLoanMonthly: input.carLoanMonthly,
      otherDebtMonthly: input.otherDebtMonthly,
    },
  });

  const application = await prisma.application.create({
    data: {
      clinicId: input.clinicId,
      patientId: patient.id,
      treatmentType: input.treatmentType,
      treatmentCost: input.treatmentCost,
      status: "submitted",
    },
  });

  await logEvent(application.id, "application.submitted", {
    patientId: patient.id,
    clinicId: input.clinicId,
  });

  const lenders = await prisma.lender.findMany({ where: { active: true } });
  const result = evaluate(patient, input.treatmentCost, lenders);

  await logEvent(application.id, "eligibility.evaluated", {
    eligible: result.eligible,
    newDBR: result.newDBR,
    matchCount: result.matches.length,
  });

  if (!result.eligible) {
    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { status: "rejected" },
      include: { clinic: true, patient: true, lender: true },
    });
    await logEvent(application.id, "application.rejected", {
      reason: "no_eligible_lenders",
    });
    return { application: updated, matches: [], result };
  }

  const topMatch = selectTopMatch(result.matches);

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: {
      status: "prequalified",
      lenderId: topMatch!.lenderId,
      offerMonthly: topMatch!.monthlyPayment,
      offerTerm: topMatch!.term,
      approvalChance: topMatch!.matchScore,
    },
    include: { clinic: true, patient: true, lender: true },
  });

  await logEvent(application.id, "lender.matched", {
    topLenderId: topMatch!.lenderId,
    topLenderName: topMatch!.lenderName,
    matchLabel: topMatch!.matchLabel,
    totalMatches: result.matches.length,
  });

  await logEvent(application.id, "application.prequalified", {
    offerMonthly: topMatch!.monthlyPayment,
    offerTerm: topMatch!.term,
  });

  return { application: updated, matches: result.matches, result };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  await logEvent(applicationId, `application.${status}`, {});

  return application;
}
