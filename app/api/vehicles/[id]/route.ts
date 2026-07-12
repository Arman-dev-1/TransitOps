import { MANAGER_ROLES, requireRole, requireSession } from "../../../lib/authorization";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: RouteContext<"/api/vehicles/[id]">) {
  try {
    await requireSession();
    const { id } = await params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    return vehicle ? Response.json({ data: vehicle }) : Response.json({ error: "Vehicle not found" }, { status: 404 });
  } catch (error) { return error instanceof Response ? error : Response.json({ error: "Database unavailable" }, { status: 503 }); }
}

export async function PATCH(request: Request, { params }: RouteContext<"/api/vehicles/[id]">) {
  try {
    await requireRole(MANAGER_ROLES);
    const { id } = await params;
    const body = await request.json();
    const data = {
      ...(typeof body.name === "string" && { name: body.name.trim() }),
      ...(typeof body.type === "string" && { type: body.type.trim() }),
      ...(typeof body.status === "string" && ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"].includes(body.status) && { status: body.status }),
      ...(Number.isFinite(Number(body.odometer)) && { odometer: Number(body.odometer) }),
    };
    const vehicle = await prisma.vehicle.update({ where: { id }, data });
    return Response.json({ data: vehicle });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Unable to update vehicle" }, { status: 400 }); }
}

export async function DELETE(_request: Request, { params }: RouteContext<"/api/vehicles/[id]">) {
  try { await requireRole(MANAGER_ROLES); const { id } = await params; await prisma.vehicle.delete({ where: { id } }); return new Response(null, { status: 204 }); }
  catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Unable to delete vehicle. Remove related trips and maintenance records first." }, { status: 400 }); }
}
