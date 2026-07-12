import { prisma } from "../../lib/prisma";
import { MANAGER_ROLES, requireSession } from "../../lib/authorization";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    const [users, invitations] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.invitation.findMany({
        where: { acceptedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
      }),
    ]);
    return Response.json({ data: { users, invitations } });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Unable to load team" }, { status: 503 });
  }
}
