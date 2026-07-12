import "server-only";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "../auth";

export const MANAGER_ROLES = ["FLEET_MANAGER"] as const;

export async function getSession() { return getServerSession(authOptions); }

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) throw new Response("Authentication required", { status: 401 });
  return session as Session;
}

export async function requireRole(roles: readonly string[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) throw new Response("You do not have permission to perform this action", { status: 403 });
  return session;
}
