import { prisma } from "../../lib/prisma";
import { MANAGER_ROLES, requireRole, requireSession } from "../../lib/authorization";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return Response.json({
      data: await prisma.trip.findMany({
        orderBy: { createdAt: "desc" },
        include: { vehicle: true, driver: true },
      }),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Unable to load trips" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(MANAGER_ROLES);
    const body = await request.json();
    const source = typeof body.source === "string" ? body.source.trim() : "";
    const destination = typeof body.destination === "string" ? body.destination.trim() : "";
    const cargoWeight = Number(body.cargoWeight);
    const vehicleId = typeof body.vehicleId === "string" ? body.vehicleId : "";
    const driverId = typeof body.driverId === "string" ? body.driverId : "";
    const status = ["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"].includes(body.status) ? body.status : "DRAFT";

    if (!source || !destination || !vehicleId || !driverId || !Number.isFinite(cargoWeight) || cargoWeight <= 0) {
      return Response.json({ error: "source, destination, cargoWeight, vehicleId, and driverId are required." }, { status: 400 });
    }

    const trip = await prisma.trip.create({
      data: { source, destination, cargoWeight, vehicleId, driverId, status },
      include: { vehicle: true, driver: true },
    });

    return Response.json({ data: trip }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Unable to create trip." }, { status: 400 });
  }
}
