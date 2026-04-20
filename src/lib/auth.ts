import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {prisma} from "@/lib/db";

const {handlers, auth, signIn, signOut} = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {label: "Email", type: "email"},
        password: {label: "Password", type: "password"},
      },
      async authorize(credentials) {
        console.log("[Auth] authorize called with:", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.adminUser.findUnique({
          where: {email: credentials.email as string},
        });

        console.log("[Auth] user found:", user ? "yes" : "no");
        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        console.log("[Auth] password valid:", isValid);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.email.split("@")[0],
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({token, user}) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role;
      }
      return token;
    },
    session({session, token}) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  basePath: "/api/auth",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});

export {handlers, auth, signIn, signOut};