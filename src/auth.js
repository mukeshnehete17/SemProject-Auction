import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        return token;
      }
      // Refresh role from the authoritative user record so admin role
      // changes (or account deletion) take effect without re-login.
      if (token?.id) {
        try {
          const fresh = await prisma.user.findUnique({
            where: { id: Number(token.id) },
            select: { role: true },
          });
          token.role = fresh ? fresh.role : null;
        } catch {
          // Keep the existing token on transient DB failures.
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;

        const normalizedEmail = String(email).trim().toLowerCase();
        try {
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });
          if (!user || !user.password) return null;

          const valid = await bcrypt.compare(String(password), user.password);
          if (!valid) return null;

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (err) {
          console.error("[TORI Auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
});