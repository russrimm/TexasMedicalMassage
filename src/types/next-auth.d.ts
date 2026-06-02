import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "therapist" | "business" | "admin" | null;
    onboardedAt?: Date | null;
  }
  interface Session {
    user: {
      id: string;
      role: "therapist" | "business" | "admin" | null;
      onboarded: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "therapist" | "business" | "admin" | null;
    onboarded: boolean;
  }
}
