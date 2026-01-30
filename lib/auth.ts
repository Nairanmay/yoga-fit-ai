import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Optional: Add simple email/password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your DB lookup logic here. 
        // For now, we return a mock user to allow testing.
        if (credentials?.email === "yogi@example.com" && credentials?.password === "namaste") {
          return { id: "1", name: "Yogi Demo", email: "yogi@example.com" };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/login', // Custom login page
    error: '/login', // Error code passed in query string
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID to session so we can fetch their yoga plan later
      if (session.user) {
        (session.user as any).id = token.sub; 
      }
      return session;
    },
  },
};