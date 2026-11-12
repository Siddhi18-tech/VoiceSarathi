import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Protect the main rider dashboard root route.
     * All unauthenticated visitors are redirected to /login.
     */
    "/",
  ],
};

