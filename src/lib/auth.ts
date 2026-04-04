import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        const authUser = user as any;

        if (!authUser || !authUser?.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          authUser.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "kai_super_secret_fallback",
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        // Pass the user ID and isVerified to the token on initial login
        token.sub = user.id;
        token.isVerified = (user as any).isVerified;
      }
      
      // Allow dynamic updating of the token after a user verifies their email manually
      if (trigger === "update" && session && session.isVerified !== undefined) {
        token.isVerified = session.isVerified;
      }
      
      return token;
    },
    session: ({ session, token }) => {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).isVerified = token.isVerified;
      }
      return session;
    }
  }
};
