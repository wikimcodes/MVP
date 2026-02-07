import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-clinic-password");
  if (password !== process.env.CLINIC_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    include: {
      patient: true,
      lender: true,
      clinic: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(applications);
}
