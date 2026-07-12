import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; role: "FLEET_MANAGER" | "DRIVER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST" };
  }
  interface User { role: "FLEET_MANAGER" | "DRIVER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST"; }
}

declare module "next-auth/jwt" { interface JWT { role?: "FLEET_MANAGER" | "DRIVER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST"; } }
