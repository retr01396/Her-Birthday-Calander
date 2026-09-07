type AppRole = "STUDENT" | "SUPER_ADMIN" | "CLUB";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role?: AppRole;
    isOnboarded?: boolean;
    clubId?: string;
    slug?: string;
    username?: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: AppRole;
      isOnboarded?: boolean;
      clubId?: string;
      slug?: string;
      username?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    isOnboarded?: boolean;
    clubId?: string;
    slug?: string;
    username?: string;
  }
}
