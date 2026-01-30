import { withAuth } from "next-auth/middleware";

// Explicitly export the middleware function
export default withAuth({
  pages: {
    signIn: "/login", // Redirects here if not logged in
  },
});

export const config = { 
  // List the routes you want to protect
  matcher: ["/plan", "/live", "/detect"] 
};