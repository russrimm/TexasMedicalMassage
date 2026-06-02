import NextAuth from "next-auth";
import { authConfig } from "@/server/auth/config";

export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const session = req.auth;

  // Force onboarding for logged-in users without a role.
  if (
    isLoggedIn &&
    session?.user &&
    !session.user.onboarded &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/signout")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/onboarding/role";
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
