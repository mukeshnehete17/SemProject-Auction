export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        return token;
      }
      // Refresh role on subsequent JWT invocations so admin role
      // changes (or account deletion) take effect without re-login.
      // Fail closed: a deleted account loses its role and is denied
      // by every server-side authorization check.
      // NOTE: auth.config.js must stay edge-safe (proxy imports it),
      // so the DB lookup lives in src/auth.js via the merged callbacks.
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};