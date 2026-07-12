import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [CredentialsProvider({
    name: "Transit Ops account",
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(credentials) {
      const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : "";
      const password = typeof credentials?.password === "string" ? credentials.password : "";
      if (!email || !password) return null;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) return null;
      return { id: user.id, email: user.email, name: user.name ?? user.email.split("@")[0], role: user.role };
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) token.role = user.role; return token; },
    session({ session, token }) {
      if (session.user) { session.user.id = token.sub!; session.user.role = token.role ?? "DRIVER"; }
      return session;
    },
  },
};
