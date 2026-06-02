import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-compatible config (no DB / no bcrypt). Used by middleware.
 * Full config (with Credentials + Drizzle adapter) lives in ./index.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/signin",
  },
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role ?? null;
        token.onboarded = Boolean(user.onboardedAt);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = (token.role ?? null) as typeof session.user.role;
        session.user.onboarded = Boolean(token.onboarded);
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const protectedRoutes = ["/dashboard", "/messages", "/profile", "/onboarding", "/settings"];
      const isProtected = protectedRoutes.some((p) => pathname.startsWith(p));
      const isJobNew = pathname === "/jobs/new" || pathname.endsWith("/edit");
      const isAdmin = pathname.startsWith("/admin");

      if ((isProtected || isJobNew || isAdmin) && !isLoggedIn) return false;
      if (isAdmin && auth?.user?.role !== "admin") return false;
      return true;
    },
  },
} satisfies NextAuthConfig;
