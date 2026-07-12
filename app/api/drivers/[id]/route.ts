import { MANAGER_ROLES, requireRole, requireSession } from "../../../lib/authorization";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: RouteContext<"/api/drivers/[id]">) {
  try {
    await requireSession();
    const { id } = await params;
    const driver = await prisma.driver.findUnique({ where: { id } });
    return driver ? Response.json({ data: driver }) : Response.json({ error: "Driver not found" }, { status: 404 });
  } catch (error) {
    return error instanceof Response ? error : Response.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext<"/api/drivers/[id]">) {
  try {
    await requireRole(MANAGER_ROLES);
    const { id } = await params;
    const body = await request.json();
    const data: any = {};
    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.licenseNumber === "string") data.licenseNumber = body.licenseNumber.trim();
    if (typeof body.licenseExpiry === "string") data.licenseExpiry = new Date(body.licenseExpiry);
    if (typeof body.status === "string" && ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"].includes(body.status)) {
      data.status = body.status;
    }
    if (Number.isFinite(Number(body.safetyScore))) {
      data.safetyScore = Math.min(100, Math.max(0, Number(body.safetyScore)));
    }
    const driver = await prisma.driver.update({ where: { id }, data });
    return Response.json({ data: driver });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Unable to update driver" }, { status: 400 });
  }
}
