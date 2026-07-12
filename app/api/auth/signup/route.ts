import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      return Response.json({ error: "Enter your name, a valid email, and a password of at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return Response.json({ error: "An account with this email already exists." }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 12),
        role: "FLEET_MANAGER",
      },
    });

    return Response.json({ data: { id: user.id, email: user.email, role: user.role } }, { status: 201 });
  } catch (error) {
    console.error("Unable to create admin account", error);
    return Response.json({ error: "Unable to create account. Please try again." }, { status: 500 });
  }
}
