import { prisma } from "../../lib/prisma";
import { MANAGER_ROLES, requireRole, requireSession } from "../../lib/authorization";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return Response.json({ data: await prisma.vehicle.findMany({ orderBy: { regNumber: "asc" } }) });
  } catch (error) {
    console.error("Unable to load vehicles", error);
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(MANAGER_ROLES);
    const body = await request.json();
    const regNumber = typeof body.regNumber === "string" ? body.regNumber.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const maxLoadCapacity = Number(body.maxLoadCapacity);
    if (!regNumber || !name || !type || !Number.isFinite(maxLoadCapacity) || maxLoadCapacity <= 0) {
      return Response.json({ error: "regNumber, name, type, and a positive maxLoadCapacity are required." }, { status: 400 });
    }
    const vehicle = await prisma.vehicle.create({ data: { regNumber, name, type, maxLoadCapacity } });
    return Response.json({ data: vehicle }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Unable to create vehicle", error);
    return Response.json({ error: "Unable to create vehicle. Registration numbers must be unique." }, { status: 400 });
  }
}
