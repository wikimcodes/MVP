import { NextRequest, NextResponse } from "next/server";
import { submitApplication } from "@/modules/applications/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const required = [
      "clinicId", "emiratesId", "name", "phone", "email",
      "nationality", "visaType", "yearsInUAE", "employer",
      "salaryMonthly", "treatmentType", "treatmentCost",
    ];

    for (const field of required) {
      if (body[field] === undefined || body[field] === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const result = await submitApplication({
      clinicId: body.clinicId,
      emiratesId: body.emiratesId,
      name: body.name,
      phone: body.phone,
      email: body.email,
      nationality: body.nationality,
      visaType: body.visaType,
      yearsInUAE: Number(body.yearsInUAE),
      employer: body.employer,
      salaryMonthly: Number(body.salaryMonthly),
      mortgageMonthly: Number(body.mortgageMonthly || 0),
      carLoanMonthly: Number(body.carLoanMonthly || 0),
      otherDebtMonthly: Number(body.otherDebtMonthly || 0),
      treatmentType: body.treatmentType,
      treatmentCost: Number(body.treatmentCost),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
