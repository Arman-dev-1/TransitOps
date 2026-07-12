import { MANAGER_ROLES, requireRole, requireSession } from "../../../lib/authorization";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: RouteContext<"/api/maintenance/[id]">) {
  try {
    await requireSession();
    const { id } = await params;
    const record = await prisma.maintenance.findUnique({ where: { id }, include: { vehicle: true } });
    return record ? Response.json({ data: record }) : Response.json({ error: "Maintenance record not found" }, { status: 404 });
  } catch (error) {
    return error instanceof Response ? error : Response.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext<"/api/maintenance/[id]">) {
  try {
    await requireRole(MANAGER_ROLES);
    const { id } = await params;
    const body = await request.json();
    const data: any = {};
    if (typeof body.issue === "string") data.issue = body.issue.trim();
    if (typeof body.notes === "string") data.notes = body.notes.trim();
    if (typeof body.status === "string" && ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(body.status)) {
      data.status = body.status;
    }
    const record = await prisma.maintenance.update({ where: { id }, data, include: { vehicle: true } });
    return Response.json({ data: record });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Unable to update maintenance record" }, { status: 400 });
  }
}
