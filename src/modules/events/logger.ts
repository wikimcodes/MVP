import { prisma } from "@/lib/db";

export async function logEvent(
  applicationId: string,
  type: string,
  payload: Record<string, unknown> = {}
) {
  return prisma.eventLog.create({
    data: {
      applicationId,
      type,
      payloadJson: JSON.stringify(payload),
    },
  });
}
