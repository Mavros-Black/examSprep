import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: "STUDENT" | "TEACHER" | "ADMIN";
      avatar?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    avatar?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "STUDENT" | "TEACHER" | "ADMIN";
    firstName: string;
    lastName: string;
    avatar?: string;
  }
}
