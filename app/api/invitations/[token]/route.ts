import { prisma } from "../../../lib/prisma";

export async function GET(_request: Request, { params }: RouteContext<"/api/invitations/[token]">) {
  const { token } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
    return Response.json({ error: "This invitation is invalid or has expired." }, { status: 404 });
  }
  return Response.json({ data: { email: invitation.email, role: invitation.role, expiresAt: invitation.expiresAt } });
}
