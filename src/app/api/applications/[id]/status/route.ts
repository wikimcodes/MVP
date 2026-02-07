import { NextRequest, NextResponse } from "next/server";
import { updateApplicationStatus } from "@/modules/applications/service";

const VALID_STATUSES = ["approved", "rejected", "funded"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const password = req.headers.get("x-clinic-password");
    if (password !== process.env.CLINIC_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const application = await updateApplicationStatus(params.id, status);
    return NextResponse.json(application);
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
