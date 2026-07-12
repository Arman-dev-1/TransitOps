import { prisma } from "../../lib/prisma";
import { MANAGER_ROLES, requireRole, requireSession } from "../../lib/authorization";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return Response.json({
      data: await prisma.maintenance.findMany({
        orderBy: { createdAt: "desc" },
        include: { vehicle: true },
      }),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Unable to load maintenance records" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(MANAGER_ROLES);
    const body = await request.json();
    const vehicleId = typeof body.vehicleId === "string" ? body.vehicleId : "";
    const issue = typeof body.issue === "string" ? body.issue.trim() : "";

    if (!vehicleId || !issue) {
      return Response.json({ error: "vehicleId and issue are required." }, { status: 400 });
    }

    const record = await prisma.maintenance.create({
      data: { vehicleId, issue, status: "OPEN" },
      include: { vehicle: true },
    });

    return Response.json({ data: record }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Unable to create maintenance record." }, { status: 400 });
  }
}
