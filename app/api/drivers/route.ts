import { prisma } from "../../lib/prisma";
import { MANAGER_ROLES, requireRole, requireSession } from "../../lib/authorization";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return Response.json({
      data: await prisma.driver.findMany({ orderBy: { name: "asc" } }),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Unable to load drivers" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(MANAGER_ROLES);
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const licenseNumber = typeof body.licenseNumber === "string" ? body.licenseNumber.trim() : "";
    const licenseExpiry = typeof body.licenseExpiry === "string" ? body.licenseExpiry : "";
    const safetyScore = Number(body.safetyScore ?? 100);

    if (!name || !licenseNumber || !licenseExpiry) {
      return Response.json({ error: "name, licenseNumber, and licenseExpiry are required." }, { status: 400 });
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        safetyScore: Number.isFinite(safetyScore) ? Math.min(100, Math.max(0, safetyScore)) : 100,
      },
    });

    return Response.json({ data: driver }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Unable to create driver. License numbers must be unique." }, { status: 400 });
  }
}
