import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!token || !name || password.length < 8) return Response.json({ error: "Enter your name and a password of at least 8 characters." }, { status: 400 });
    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) return Response.json({ error: "This invitation is invalid or has expired." }, { status: 400 });
    const user = await prisma.$transaction(async (tx) => {
      const account = await tx.user.create({ data: { email: invitation.email, name, password: await bcrypt.hash(password, 12), role: invitation.role } });
      await tx.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } });
      return account;
    });
    return Response.json({ data: { id: user.id, email: user.email } }, { status: 201 });
  } catch { return Response.json({ error: "Unable to accept invitation. The email may already have an account." }, { status: 400 }); }
}
