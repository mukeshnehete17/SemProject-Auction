import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma, resolveDatabaseKind, getDatabaseUrl } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

function maskEmail(email) {
  if (!email || typeof email !== "string") return "[unknown]";
  const [local, domain] = email.split("@");
  if (!domain) return "[invalid-email]";
  const visible = local.length > 2 ? local.slice(0, 2) + "***" : "*";
  return `${visible}@${domain}`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        console.log(`[TORI Auth] JWT created for user id=${user.id}, role=${user.role}`);
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
          if (fresh?.role) {
            token.role = fresh.role;
          }
        } catch (err) {
          console.warn("[TORI Auth] JWT role refresh warning:", err?.code || err?.message || "DB lookup skipped");
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
        if (!email || !password) {
          console.warn("[TORI Auth] Authorize rejected: Missing email or password input");
          return null;
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const masked = maskEmail(normalizedEmail);
        const dbUrl = getDatabaseUrl();
        const dbKind = resolveDatabaseKind(dbUrl);

        console.log(`[TORI Auth] Authorize attempt for ${masked} (Database kind: ${dbKind})`);

        try {
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!user) {
            console.warn(`[TORI Auth] User lookup result: USER_NOT_FOUND for ${masked}`);
            return null;
          }

          if (!user.password) {
            console.warn(`[TORI Auth] User lookup result: NO_PASSWORD_HASH for ${masked}`);
            return null;
          }

          const valid = await bcrypt.compare(String(password), user.password);
          if (!valid) {
            console.warn(`[TORI Auth] Password verification result: PASSWORD_MISMATCH for ${masked}`);
            return null;
          }

          console.log(`[TORI Auth] Password verification result: SUCCESS for ${masked} (id=${user.id}, role=${user.role})`);

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (err) {
          console.error(`[TORI Auth] Database query failure during authorize for ${masked}:`, {
            name: err?.name,
            code: err?.code,
            message: err?.message,
          });
          return null;
        }
      },
    }),
  ],
});