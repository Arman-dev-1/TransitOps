import { randomBytes } from "crypto";
import { MANAGER_ROLES, requireRole } from "../../lib/authorization";
import { prisma } from "../../lib/prisma";

const roles = ["DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST", "FLEET_MANAGER"] as const;

export async function GET() {
  try {
    await requireRole(MANAGER_ROLES);
    const invitations = await prisma.invitation.findMany({ orderBy: { createdAt: "desc" }, where: { acceptedAt: null } });
    return Response.json({ data: invitations.map(({ token, ...invite }) => ({ ...invite, invitePath: `/invite/${token}` })) });
  } catch (error) { return error instanceof Response ? error : Response.json({ error: "Unable to load invitations" }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    await requireRole(MANAGER_ROLES);
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = roles.includes(body.role) ? body.role : "DRIVER";
    if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter a valid work email." }, { status: 400 });
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return Response.json({ error: "This email already has an account." }, { status: 409 });
    const invitation = await prisma.invitation.upsert({ where: { email }, update: { role, token: randomBytes(32).toString("hex"), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), acceptedAt: null }, create: { email, role, token: randomBytes(32).toString("hex"), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) } });
    return Response.json({ data: { email: invitation.email, role: invitation.role, invitePath: `/invite/${invitation.token}`, expiresAt: invitation.expiresAt } }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Unable to create invitation", error);
    return Response.json({ error: "Unable to create invitation." }, { status: 400 });
  }
}
