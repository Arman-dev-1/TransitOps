import { MANAGER_ROLES, requireRole, requireSession } from "../../../lib/authorization";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: RouteContext<"/api/trips/[id]">) {
  try {
    await requireSession();
    const { id } = await params;
    const trip = await prisma.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true } });
    return trip ? Response.json({ data: trip }) : Response.json({ error: "Trip not found" }, { status: 404 });
  } catch (error) {
    return error instanceof Response ? error : Response.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext<"/api/trips/[id]">) {
  try {
    await requireRole(MANAGER_ROLES);
    const { id } = await params;
    const body = await request.json();
    const data: any = {};
    if (typeof body.source === "string") data.source = body.source.trim();
    if (typeof body.destination === "string") data.destination = body.destination.trim();
    if (Number.isFinite(Number(body.cargoWeight))) data.cargoWeight = Number(body.cargoWeight);
    if (typeof body.vehicleId === "string") data.vehicleId = body.vehicleId;
    if (typeof body.driverId === "string") data.driverId = body.driverId;
    if (typeof body.status === "string" && ["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"].includes(body.status)) {
      data.status = body.status;
    }
    const trip = await prisma.trip.update({ where: { id }, data, include: { vehicle: true, driver: true } });
    return Response.json({ data: trip });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Unable to update trip" }, { status: 400 });
  }
}
